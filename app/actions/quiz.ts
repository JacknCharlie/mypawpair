"use server";

import { createClient } from "@/lib/supabase/server";

export interface QuizData {
  name: string;
  breed: string;
  age: string;
  size: "small" | "medium" | "large";
  energy_level: number;
  temperament: string[];
  special_needs: boolean;
  special_notes: string;
  city: string;
  zip_code: string;
  care_type: string[];
  availability: string;
}

export interface MatchResult {
  caregiver_id: string;
  caregiver_name: string;
  bio: string | null;
  experience_years: number | null;
  services: string[] | null;
  city: string | null;
  availability: string | null;
  total_score: number;
  compatibility_tier: "high" | "medium" | "low";
  location_score: number;
  size_score: number;
  temperament_score: number;
  availability_score: number;
  experience_score: number;
}

function calcLocationScore(dogCity: string, caregiverCity: string | null): number {
  if (!dogCity || !caregiverCity) return 0;
  return dogCity.trim().toLowerCase() === caregiverCity.trim().toLowerCase() ? 5 : 0;
}

function calcSizeScore(dogSize: string, acceptsSizes: string[] | null): number {
  if (!acceptsSizes || acceptsSizes.length === 0) return 0;
  return acceptsSizes.includes(dogSize) ? 5 : 0;
}

function calcTemperamentScore(dogTemperament: string[], acceptsTemperaments: string[] | null): number {
  if (!dogTemperament || dogTemperament.length === 0) return 3;
  if (!acceptsTemperaments || acceptsTemperaments.length === 0) return 3;
  const overlap = dogTemperament.filter((t) => acceptsTemperaments.includes(t));
  return Math.min(5, Math.round((overlap.length / dogTemperament.length) * 5));
}

function calcAvailabilityScore(dogAvailability: string, caregiverAvailability: string | null): number {
  if (!caregiverAvailability) return 2;
  if (caregiverAvailability === "anytime") return 5;
  if (dogAvailability === "anytime") return 4;
  return dogAvailability === caregiverAvailability ? 5 : 2;
}

function calcExperienceScore(years: number | null): number {
  if (years === null || years === 0) return 1;
  if (years <= 2) return 2;
  if (years <= 4) return 3;
  if (years <= 7) return 4;
  return 5;
}

function getTier(total: number): "high" | "medium" | "low" {
  if (total >= 20) return "high";
  if (total >= 12) return "medium";
  return "low";
}

export async function submitQuizAndMatch(quiz: QuizData): Promise<{
  success: boolean;
  dogId?: string;
  matches?: MatchResult[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    return { success: false, error: "Not authenticated" };
  }

  const userId = claimsData.claims.sub as string;

  // 1. Insert the dog
  const { data: dog, error: dogError } = await supabase
    .from("dogs")
    .insert({
      owner_id: userId,
      name: quiz.name,
      breed: quiz.breed || null,
      size: quiz.size,
      age: quiz.age ? parseInt(quiz.age) : null,
      energy_level: quiz.energy_level,
      temperament: quiz.temperament.length > 0 ? quiz.temperament : null,
      special_needs: quiz.special_needs,
      special_notes: quiz.special_notes || null,
      city: quiz.city || null,
      zip_code: quiz.zip_code || null,
      care_type: quiz.care_type,
      availability: quiz.availability || null,
    })
    .select("id")
    .single();

  if (dogError || !dog) {
    return { success: false, error: dogError?.message ?? "Failed to save dog" };
  }

  // 2. Fetch all caregivers with their profile names
  const { data: caregivers } = await supabase
    .from("caregivers")
    .select(`
      id, bio, experience_years, accepts_sizes, accepts_temperaments,
      services, city, availability,
      profiles ( full_name )
    `);

  if (!caregivers || caregivers.length === 0) {
    return { success: true, dogId: dog.id, matches: [] };
  }

  // 3. Score each caregiver
  const scoredMatches = caregivers.map((cg) => {
    const loc  = calcLocationScore(quiz.city, cg.city);
    const size = calcSizeScore(quiz.size, cg.accepts_sizes);
    const temp = calcTemperamentScore(quiz.temperament, cg.accepts_temperaments);
    const avail = calcAvailabilityScore(quiz.availability, cg.availability);
    const exp  = calcExperienceScore(cg.experience_years);
    const total = loc + size + temp + avail + exp;
    const profile = (cg.profiles as unknown) as { full_name: string | null } | null;

    return {
      caregiver_id: cg.id,
      caregiver_name: profile?.full_name ?? "Caregiver",
      bio: cg.bio,
      experience_years: cg.experience_years,
      services: cg.services,
      city: cg.city,
      availability: cg.availability,
      total_score: total,
      compatibility_tier: getTier(total),
      location_score: loc,
      size_score: size,
      temperament_score: temp,
      availability_score: avail,
      experience_score: exp,
    } satisfies MatchResult;
  });

  // Sort by total score descending
  scoredMatches.sort((a, b) => b.total_score - a.total_score);

  // 4. Upsert matches into the matches table
  if (scoredMatches.length > 0) {
    const { error: upsertError } = await supabase.from("matches").upsert(
      scoredMatches.map((m) => ({
        dog_id: dog.id,
        caregiver_id: m.caregiver_id,
        location_score: m.location_score,
        size_score: m.size_score,
        temperament_score: m.temperament_score,
        availability_score: m.availability_score,
        experience_score: m.experience_score,
        match_status: "suggested",
      })),
      { onConflict: "dog_id,caregiver_id" }
    );
    if (upsertError) {
      console.error("[quiz] matches upsert failed:", upsertError.message);
      return { success: false, error: `Matches could not be saved: ${upsertError.message}` };
    }
  }

  return { success: true, dogId: dog.id, matches: scoredMatches };
}

// Re-run matching for an existing dog (no new dog created)
export async function rematchExistingDog(dogId: string): Promise<{
  success: boolean;
  dogId?: string;
  matches?: MatchResult[];
  error?: string;
}> {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) return { success: false, error: "Not authenticated" };

  const userId = claimsData.claims.sub as string;

  // Verify dog belongs to this owner
  const { data: dog } = await supabase
    .from("dogs")
    .select("id, size, temperament, city, availability")
    .eq("id", dogId)
    .eq("owner_id", userId)
    .single();

  if (!dog) return { success: false, error: "Dog not found" };

  const { data: caregivers } = await supabase
    .from("caregivers")
    .select(`id, bio, experience_years, accepts_sizes, accepts_temperaments, services, city, availability, profiles ( full_name )`);

  if (!caregivers || caregivers.length === 0) return { success: true, dogId: dog.id, matches: [] };

  const scoredMatches = caregivers.map((cg) => {
    const loc   = calcLocationScore(dog.city ?? "", cg.city);
    const size  = calcSizeScore(dog.size ?? "", cg.accepts_sizes);
    const temp  = calcTemperamentScore(dog.temperament ?? [], cg.accepts_temperaments);
    const avail = calcAvailabilityScore(dog.availability ?? "", cg.availability);
    const exp   = calcExperienceScore(cg.experience_years);
    const total = loc + size + temp + avail + exp;
    const profile = (cg.profiles as unknown) as { full_name: string | null } | null;

    return {
      caregiver_id: cg.id,
      caregiver_name: profile?.full_name ?? "Caregiver",
      bio: cg.bio,
      experience_years: cg.experience_years,
      services: cg.services,
      city: cg.city,
      availability: cg.availability,
      total_score: total,
      compatibility_tier: getTier(total),
      location_score: loc,
      size_score: size,
      temperament_score: temp,
      availability_score: avail,
      experience_score: exp,
    } satisfies MatchResult;
  });

  scoredMatches.sort((a, b) => b.total_score - a.total_score);

  if (scoredMatches.length > 0) {
    const { error: upsertError } = await supabase.from("matches").upsert(
      scoredMatches.map((m) => ({
        dog_id: dog.id,
        caregiver_id: m.caregiver_id,
        location_score: m.location_score,
        size_score: m.size_score,
        temperament_score: m.temperament_score,
        availability_score: m.availability_score,
        experience_score: m.experience_score,
        match_status: "suggested",
      })),
      { onConflict: "dog_id,caregiver_id" }
    );
    if (upsertError) {
      console.error("[rematch] matches upsert failed:", upsertError.message);
      return { success: false, error: `Matches could not be saved: ${upsertError.message}` };
    }
  }

  return { success: true, dogId: dog.id, matches: scoredMatches };
}
