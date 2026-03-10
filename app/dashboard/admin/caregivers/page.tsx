import { createClient } from "@/lib/supabase/server";
import { AdminCaregiversPage } from "@/components/admin/admin-caregivers-page";

export default async function CaregiversPage() {
  const supabase = await createClient();

  const { data: caregivers } = await supabase
    .from("profiles")
    .select("id, full_name, city, phone, created_at, caregiver_details:caregivers(*)")
    .eq("role", "caregiver")
    .order("created_at", { ascending: false });

  return <AdminCaregiversPage initialCaregivers={caregivers ?? []} />;
}
