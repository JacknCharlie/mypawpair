import { createClient } from "@/lib/supabase/server";
import { AdminWaitlistPage } from "@/components/admin/admin-waitlist-page";

export const dynamic = "force-dynamic";

export default async function WaitlistPage() {
  const supabase = await createClient();

  const { data: waitlist } = await supabase
    .from("waitlist")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  return <AdminWaitlistPage initialWaitlist={waitlist ?? []} />;
}
