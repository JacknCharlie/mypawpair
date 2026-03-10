"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface OwnerInput {
  full_name: string;
  city: string;
  phone: string;
}

export async function updateOwner(id: string, input: OwnerInput) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: input.full_name || null,
      city: input.city || null,
      phone: input.phone || null,
    })
    .eq("id", id);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/dashboard/admin/owners");
  return { success: true as const };
}

export async function deleteOwner(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").delete().eq("id", id);

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/dashboard/admin/owners");
  revalidatePath("/dashboard/admin/dogs");
  return { success: true as const };
}
