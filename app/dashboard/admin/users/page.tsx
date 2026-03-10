import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUsersPage } from "@/components/admin/admin-users-page";

export const dynamic = "force-dynamic";

export interface UserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  city: string | null;
  phone: string | null;
  created_at: string;
  dogs: { id: string }[];
  caregiver_details: { id: string }[];
}

export default async function UsersPage() {
  const admin = createAdminClient();
  const supabase = await createClient();

  const { data: authData } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 500,
  });
  const authUsers = authData?.users ?? [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, role, city, phone, created_at, dogs(id), caregivers(id)")
    .order("created_at", { ascending: false });

  const profileMap = new Map(
    (profiles ?? []).map((p) => {
      const row = p as { dogs?: { id: string }[]; caregivers?: { id: string }[] };
      return [
        p.id,
        {
          ...p,
          dogs: row.dogs ?? [],
          caregiver_details: row.caregivers ?? [],
        },
      ];
    })
  );

  const users: UserRow[] = authUsers.map((u) => {
    const p = profileMap.get(u.id);
    return {
      id: u.id,
      email: u.email ?? null,
      full_name: p?.full_name ?? (u.user_metadata?.full_name as string | undefined) ?? null,
      role: p?.role ?? "owner",
      city: p?.city ?? null,
      phone: p?.phone ?? null,
      created_at: p?.created_at ?? u.created_at ?? new Date().toISOString(),
      dogs: p?.dogs ?? [],
      caregiver_details: p?.caregiver_details ?? [],
    };
  });

  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, owner:profiles(full_name)")
    .order("name");

  const dogOptions = (dogs ?? []).map((d) => {
    const raw = d as { owner?: { full_name: string | null } | { full_name: string | null }[] | null };
    const owner = Array.isArray(raw.owner) ? raw.owner[0] ?? null : raw.owner ?? null;
    return { id: d.id, name: d.name, owner };
  });

  return (
    <AdminUsersPage
      initialUsers={users}
      dogs={dogOptions}
    />
  );
}
