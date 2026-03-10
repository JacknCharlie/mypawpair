"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface CreateMatchInput {
  dog_id: string;
  caregiver_id: string;
  location_score: number | null;
  size_score: number | null;
  temperament_score: number | null;
  availability_score: number | null;
  experience_score: number | null;
  match_status: string;
}

interface MatchInput {
  location_score: number | null;
  size_score: number | null;
  temperament_score: number | null;
  availability_score: number | null;
  experience_score: number | null;
  match_status: string;
}

export async function updateMatch(id: string, input: MatchInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("matches")
    .update({
      location_score: input.location_score,
      size_score: input.size_score,
      temperament_score: input.temperament_score,
      availability_score: input.availability_score,
      experience_score: input.experience_score,
      match_status: input.match_status,
    })
    .eq("id", id);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/dashboard/admin/matches");
  return { success: true as const };
}

export async function updateMatchStatus(id: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("matches")
    .update({ match_status: status })
    .eq("id", id);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/dashboard/admin/matches");
  return { success: true as const };
}

export async function deleteMatch(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("matches").delete().eq("id", id);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/dashboard/admin/matches");
  return { success: true as const };
}

export async function createMatch(input: CreateMatchInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("matches")
    .upsert(
      {
        dog_id: input.dog_id,
        caregiver_id: input.caregiver_id,
        location_score: input.location_score,
        size_score: input.size_score,
        temperament_score: input.temperament_score,
        availability_score: input.availability_score,
        experience_score: input.experience_score,
        match_status: input.match_status,
      },
      { onConflict: "dog_id,caregiver_id" }
    );

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/dashboard/admin/matches");
  return { success: true as const };
}
