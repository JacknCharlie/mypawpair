"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface ProfileInput {
  full_name: string;
  phone: string;
}

interface CaregiverInput {
  bio: string;
  experience_years: number | null;
  services: string[];
  accepts_sizes: string[];
  certifications: string;
  city: string;
  zip_code: string;
  availability: string;
}

export async function updateCaregiver(
  profileId: string,
  caregiverId: string | null,
  profile: ProfileInput,
  caregiver: CaregiverInput
) {
  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: profile.full_name || null,
      phone: profile.phone || null,
    })
    .eq("id", profileId);

  if (profileError)
    return { success: false as const, error: profileError.message };

  if (caregiverId) {
    const { error: cgError } = await supabase
      .from("caregivers")
      .update({
        bio: caregiver.bio || null,
        experience_years: caregiver.experience_years,
        services: caregiver.services.length ? caregiver.services : null,
        accepts_sizes: caregiver.accepts_sizes.length
          ? caregiver.accepts_sizes
          : null,
        certifications: caregiver.certifications || null,
        city: caregiver.city || null,
        zip_code: caregiver.zip_code || null,
        availability: caregiver.availability || null,
      })
      .eq("id", caregiverId);

    if (cgError) return { success: false as const, error: cgError.message };
  }

  revalidatePath("/dashboard/admin/caregivers");
  return { success: true as const };
}

export async function toggleApproval(caregiverId: string, approved: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("caregivers")
    .update({ is_approved: approved })
    .eq("id", caregiverId);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/dashboard/admin/caregivers");
  return { success: true as const };
}

export async function deleteCaregiver(profileId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", profileId);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/dashboard/admin/caregivers");
  return { success: true as const };
}
