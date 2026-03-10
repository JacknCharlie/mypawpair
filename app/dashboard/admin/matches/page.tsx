import { createClient } from "@/lib/supabase/server";
import { AdminMatchesPage } from "@/components/admin/admin-matches-page";

export default async function MatchesPage() {
  const supabase = await createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select(
      `*,
       dog:dogs(name, breed, owner:profiles(full_name)),
       caregiver:caregivers(caregiver_user:profiles(full_name))`
    )
    .order("created_at", { ascending: false });

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, owner:profiles(full_name)")
    .order("name");

  const { data: caregivers } = await supabase
    .from("caregivers")
    .select("id, profiles(full_name)")
    .eq("is_approved", true)
    .order("id");

  const dogOptions = (dogs ?? []).map((d) => {
    const raw = d as { owner?: { full_name: string | null } | { full_name: string | null }[] | null };
    const owner = Array.isArray(raw.owner) ? raw.owner[0] ?? null : raw.owner ?? null;
    return { id: d.id, name: d.name, owner };
  });

  const caregiverOptions = (caregivers ?? []).map((c) => {
    const raw = c as { profiles?: { full_name: string | null } | { full_name: string | null }[] | null };
    const p = Array.isArray(raw.profiles) ? raw.profiles[0] : raw.profiles;
    return { id: c.id, full_name: p?.full_name ?? "Caregiver" };
  });

  return (
    <AdminMatchesPage
      initialMatches={matches ?? []}
      dogs={dogOptions}
      caregivers={caregiverOptions}
    />
  );
}
