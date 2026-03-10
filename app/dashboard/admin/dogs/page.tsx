import { createClient } from "@/lib/supabase/server";
import { AdminDogsPage } from "@/components/admin/admin-dogs-page";

export default async function DogsPage() {
  const supabase = await createClient();

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*, owner:profiles(full_name)")
    .order("created_at", { ascending: false });

  const { data: owners } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "owner")
    .order("full_name");

  return <AdminDogsPage initialDogs={dogs ?? []} owners={owners ?? []} />;
}
