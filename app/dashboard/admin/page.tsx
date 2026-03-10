import { createClient } from "@/lib/supabase/server";
import { AdminOverviewPage } from "@/components/admin/admin-overview-page";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  const supabase = await createClient();

  const [
    { count: dogsCount },
    { count: ownersCount },
    { count: caregiversCount },
    { count: matchesCount },
    { data: allMatches },
    { data: recentMatches },
  ] = await Promise.all([
    supabase.from("dogs").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "owner"),
    supabase.from("caregivers").select("id", { count: "exact", head: true }).eq("is_approved", true),
    supabase.from("matches").select("id", { count: "exact", head: true }),
    supabase.from("matches").select("match_status, compatibility_tier, caregiver_id, total_score, caregivers(id, profiles(full_name))"),
    supabase
      .from("matches")
      .select("id, total_score, compatibility_tier, match_status, created_at, dog:dogs(name), caregiver:caregivers(profiles(full_name))")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const rows = allMatches ?? [];
  const matchesByStatus = { suggested: 0, contacted: 0, accepted: 0, rejected: 0 };
  const matchesByTier = { high: 0, medium: 0, low: 0 };
  const byCaregiver = new Map<string, { name: string; total: number; count: number }>();

  rows.forEach((m) => {
    const row = m as { match_status: string; compatibility_tier: string | null; caregiver_id: string; total_score: number; caregivers?: { profiles?: { full_name: string | null } | { full_name: string | null }[] | null } | null };
    if (row.match_status in matchesByStatus) matchesByStatus[row.match_status as keyof typeof matchesByStatus]++;
    if (row.compatibility_tier && row.compatibility_tier in matchesByTier)
      matchesByTier[row.compatibility_tier as keyof typeof matchesByTier]++;

    const cg = row.caregivers;
    const profile = cg?.profiles;
    const name = Array.isArray(profile) ? profile[0]?.full_name ?? "Caregiver" : (profile as { full_name?: string | null })?.full_name ?? "Caregiver";
    const existing = byCaregiver.get(row.caregiver_id);
    const score = row.total_score ?? 0;
    if (existing) {
      existing.total += score;
      existing.count += 1;
    } else {
      byCaregiver.set(row.caregiver_id, { name, total: score, count: 1 });
    }
  });

  const topCaregiverEntry = [...byCaregiver.entries()]
    .map(([_, v]) => ({ ...v, avg: v.count > 0 ? Math.round((v.total / v.count) * 10) / 10 : 0 }))
    .sort((a, b) => b.avg - a.avg)[0];

  const topCaregiver = topCaregiverEntry
    ? { name: topCaregiverEntry.name, avg: topCaregiverEntry.avg, count: topCaregiverEntry.count }
    : null;

  return (
    <AdminOverviewPage
      stats={{
        dogs: dogsCount ?? 0,
        owners: ownersCount ?? 0,
        caregivers: caregiversCount ?? 0,
        matches: matchesCount ?? 0,
      }}
      matchesByStatus={matchesByStatus ?? { suggested: 0, contacted: 0, accepted: 0, rejected: 0 }}
      matchesByTier={matchesByTier ?? { high: 0, medium: 0, low: 0 }}
      topCaregiver={topCaregiver}
      recentMatches={(recentMatches ?? []).map((m) => {
        const dog = m.dog as { name?: string } | null;
        const cg = m.caregiver as { profiles?: { full_name?: string | null } | { full_name?: string | null }[] } | null;
        const p = cg?.profiles;
        const cgName = Array.isArray(p) ? p[0]?.full_name : (p as { full_name?: string | null })?.full_name;
        return {
          id: m.id,
          dogName: dog?.name ?? "—",
          caregiverName: cgName ?? "—",
          score: (m as { total_score: number }).total_score ?? 0,
          tier: (m as { compatibility_tier: string | null }).compatibility_tier ?? "low",
          status: (m as { match_status: string }).match_status,
          created_at: (m as { created_at: string }).created_at,
        };
      })}
    />
  );
}
