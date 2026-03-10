"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

const ROLES = ["admin", "owner", "caregiver"] as const;
export type UserRole = (typeof ROLES)[number];

export interface CreateUserInput {
  email: string;
  full_name: string;
  role: UserRole;
  skip_email_verification: boolean;
  city?: string;
  phone?: string;
  dog_ids?: string[];
  new_dog?: {
    name: string;
    breed?: string;
    size?: string;
    age: number | null;
    energy_level: number | null;
    city?: string;
  };
  caregiver_profile?: {
    bio: string;
    experience_years: number | null;
    services: string[];
    accepts_sizes: string[];
    certifications: string;
    city: string;
    zip_code: string;
    availability: string;
  };
}

export interface UpdateUserInput {
  full_name: string;
  role?: UserRole;
  city?: string;
  phone?: string;
}

function generatePassword(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  const bytes = randomBytes(24);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export async function createUser(input: CreateUserInput) {
  const admin = createAdminClient();
  const supabase = await createClient();

  const password = generatePassword();
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: input.email.trim(),
    password,
    email_confirm: input.skip_email_verification,
    user_metadata: {
      full_name: input.full_name.trim(),
      role: input.role,
    },
  });

  if (authError) return { success: false as const, error: authError.message };
  const userId = authData.user.id;

  // Trigger creates profile; update city/phone if provided
  if (input.city?.trim() || input.phone?.trim()) {
    await supabase
      .from("profiles")
      .update({
        city: input.city?.trim() || null,
        phone: input.phone?.trim() || null,
      })
      .eq("id", userId);
  }

  // Assign existing dogs to owner
  if (input.role === "owner" && input.dog_ids?.length) {
    for (const dogId of input.dog_ids) {
      await supabase.from("dogs").update({ owner_id: userId }).eq("id", dogId);
    }
  }

  // Create new dog for owner
  if (input.role === "owner" && input.new_dog?.name?.trim()) {
    const d = input.new_dog;
    await supabase.from("dogs").insert({
      owner_id: userId,
      name: d.name.trim(),
      breed: d.breed?.trim() || null,
      size: d.size || null,
      age: d.age,
      energy_level: d.energy_level,
      city: d.city?.trim() || null,
    });
  }

  // Onboard caregiver
  if (input.role === "caregiver" && input.caregiver_profile) {
    const c = input.caregiver_profile;
    await supabase.from("caregivers").insert({
      user_id: userId,
      bio: c.bio?.trim() || null,
      experience_years: c.experience_years,
      services: c.services?.length ? c.services : null,
      accepts_sizes: c.accepts_sizes?.length ? c.accepts_sizes : null,
      certifications: c.certifications?.trim() || null,
      city: c.city?.trim() || null,
      zip_code: c.zip_code?.trim() || null,
      availability: c.availability || null,
    });
  }

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/owners");
  revalidatePath("/dashboard/admin/caregivers");
  revalidatePath("/dashboard/admin/dogs");
  return { success: true as const, userId, password };
}

export async function updateUser(userId: string, input: UpdateUserInput) {
  const admin = createAdminClient();
  const supabase = await createClient();

  const profileUpdate: Record<string, unknown> = {
    full_name: input.full_name.trim() || null,
    city: input.city?.trim() || null,
    phone: input.phone?.trim() || null,
  };
  if (input.role != null) profileUpdate.role = input.role;

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", userId);

  if (profileError) return { success: false as const, error: profileError.message };

  if (input.role != null) {
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { full_name: input.full_name.trim(), role: input.role },
    });
  }

  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/owners");
  revalidatePath("/dashboard/admin/caregivers");
  return { success: true as const };
}

export async function deleteUser(userId: string) {
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { success: false as const, error: error.message };
  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/owners");
  revalidatePath("/dashboard/admin/caregivers");
  revalidatePath("/dashboard/admin/dogs");
  revalidatePath("/dashboard/admin/matches");
  return { success: true as const };
}

export async function createDogForOwner(ownerId: string, input: {
  name: string;
  breed?: string;
  size?: string;
  age?: number | null;
  energy_level?: number | null;
  city?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("dogs").insert({
    owner_id: ownerId,
    name: input.name.trim(),
    breed: input.breed?.trim() || null,
    size: input.size || null,
    age: input.age ?? null,
    energy_level: input.energy_level ?? null,
    city: input.city?.trim() || null,
  });
  if (error) return { success: false as const, error: error.message };
  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/dogs");
  return { success: true as const };
}

export async function onboardCaregiver(userId: string, input?: {
  bio?: string;
  experience_years?: number | null;
  services?: string[];
  accepts_sizes?: string[];
  certifications?: string;
  city?: string;
  zip_code?: string;
  availability?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("caregivers").insert({
    user_id: userId,
    bio: input?.bio?.trim() || null,
    experience_years: input?.experience_years ?? null,
    services: input?.services?.length ? input.services : null,
    accepts_sizes: input?.accepts_sizes?.length ? input.accepts_sizes : null,
    certifications: input?.certifications?.trim() || null,
    city: input?.city?.trim() || null,
    zip_code: input?.zip_code?.trim() || null,
    availability: input?.availability || null,
  });
  if (error) return { success: false as const, error: error.message };
  revalidatePath("/dashboard/admin/users");
  revalidatePath("/dashboard/admin/caregivers");
  return { success: true as const };
}
