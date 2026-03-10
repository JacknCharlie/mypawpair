"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

interface DogInput {
  name: string;
  owner_id: string;
  breed: string;
  size: string;
  age: number | null;
  energy_level: number | null;
  temperament: string[];
  special_needs: boolean;
  special_notes: string;
  city: string;
  zip_code: string;
  care_type: string[];
  availability: string;
}

export async function createDog(input: DogInput) {
  const supabase = await createClient();

  const { error } = await supabase.from("dogs").insert({
    name: input.name,
    owner_id: input.owner_id,
    breed: input.breed || null,
    size: input.size || null,
    age: input.age,
    energy_level: input.energy_level,
    temperament: input.temperament.length ? input.temperament : null,
    special_needs: input.special_needs,
    special_notes: input.special_notes || null,
    city: input.city || null,
    zip_code: input.zip_code || null,
    care_type: input.care_type.length ? input.care_type : null,
    availability: input.availability || null,
  });

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/dashboard/admin/dogs");
  return { success: true as const };
}

export async function updateDog(id: string, input: DogInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("dogs")
    .update({
      name: input.name,
      owner_id: input.owner_id,
      breed: input.breed || null,
      size: input.size || null,
      age: input.age,
      energy_level: input.energy_level,
      temperament: input.temperament.length ? input.temperament : null,
      special_needs: input.special_needs,
      special_notes: input.special_notes || null,
      city: input.city || null,
      zip_code: input.zip_code || null,
      care_type: input.care_type.length ? input.care_type : null,
      availability: input.availability || null,
    })
    .eq("id", id);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/dashboard/admin/dogs");
  return { success: true as const };
}

export async function deleteDog(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("dogs").delete().eq("id", id);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/dashboard/admin/dogs");
  return { success: true as const };
}

export async function generateMatchesForDog(dogId: string) {
  const supabase = await createClient();

  const { data: dog } = await supabase
    .from("dogs")
    .select("id, size, temperament, city, availability")
    .eq("id", dogId)
    .single();

  if (!dog) return { success: false as const, error: "Dog not found" };

  const { data: caregivers } = await supabase
    .from("caregivers")
    .select("id, bio, experience_years, accepts_sizes, accepts_temperaments, services, city, availability, profiles ( full_name )");

  if (!caregivers || caregivers.length === 0) {
    revalidatePath("/dashboard/admin/dogs");
    revalidatePath("/dashboard/admin/matches");
    return { success: true as const, count: 0 };
  }

  const scoredMatches = caregivers.map((cg) => {
    const loc = calcLocationScore(dog.city ?? "", cg.city);
    const size = calcSizeScore(dog.size ?? "", cg.accepts_sizes);
    const temp = calcTemperamentScore(dog.temperament ?? [], cg.accepts_temperaments);
    const avail = calcAvailabilityScore(dog.availability ?? "", cg.availability);
    const exp = calcExperienceScore(cg.experience_years);
    return {
      caregiver_id: cg.id,
      location_score: loc,
      size_score: size,
      temperament_score: temp,
      availability_score: avail,
      experience_score: exp,
    };
  });

  scoredMatches.sort(
    (a, b) =>
      b.location_score +
      b.size_score +
      b.temperament_score +
      b.availability_score +
      b.experience_score -
      (a.location_score + a.size_score + a.temperament_score + a.availability_score + a.experience_score)
  );

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

  if (upsertError) return { success: false as const, error: upsertError.message };

  revalidatePath("/dashboard/admin/dogs");
  revalidatePath("/dashboard/admin/matches");
  return { success: true as const, count: scoredMatches.length };
}
