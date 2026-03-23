"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createService(
  providerId: string,
  data: {
    name: string;
    description?: string;
    price?: number;
    price_type?: "fixed" | "from" | "free" | "contact";
    duration_minutes?: number;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase.from("provider_services").insert({
    provider_id: providerId,
    name: data.name.trim(),
    description: data.description?.trim() || null,
    price: data.price ?? null,
    price_type: data.price_type ?? "contact",
    duration_minutes: data.duration_minutes ?? null,
    is_active: true,
  });

  if (error) return { success: false as const, error: error.message };
  revalidatePath("/dashboard/provider");
  revalidatePath("/dashboard/provider/services");
  return { success: true as const };
}

export async function updateService(
  serviceId: string,
  providerId: string,
  data: {
    name: string;
    description?: string;
    price?: number;
    price_type?: "fixed" | "from" | "free" | "contact";
    duration_minutes?: number;
    is_active?: boolean;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("provider_services")
    .update({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      price: data.price ?? null,
      price_type: data.price_type ?? "contact",
      duration_minutes: data.duration_minutes ?? null,
      is_active: data.is_active ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", serviceId)
    .eq("provider_id", providerId);

  if (error) return { success: false as const, error: error.message };
  revalidatePath("/dashboard/provider");
  revalidatePath("/dashboard/provider/services");
  return { success: true as const };
}

export async function deleteService(serviceId: string, providerId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("provider_services")
    .delete()
    .eq("id", serviceId)
    .eq("provider_id", providerId);

  if (error) return { success: false as const, error: error.message };
  revalidatePath("/dashboard/provider");
  revalidatePath("/dashboard/provider/services");
  return { success: true as const };
}
