import { createClient } from "@/lib/supabase/server";
import { AdminOwnersPage } from "@/components/admin/admin-owners-page";

export default async function OwnersPage() {
  const supabase = await createClient();

  const { data: owners } = await supabase
    .from("profiles")
    .select("id, full_name, city, phone, created_at, dogs(id)")
    .eq("role", "owner")
    .order("created_at", { ascending: false });

  return <AdminOwnersPage initialOwners={owners ?? []} />;
}
