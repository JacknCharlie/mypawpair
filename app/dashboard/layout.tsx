import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardHeader } from "@/components/dashboard-header";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: claimsData, error } = await supabase.auth.getClaims();

  if (error || !claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub as string;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .single();

  if (profile?.role === "admin") {
    return <>{children}</>;
  }

  if (profile?.role === "provider") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EA]">
      <DashboardHeader
        userName={profile?.full_name ?? ""}
        userRole={(profile?.role as "owner" | "caregiver" | "admin") ?? "owner"}
      />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-10">
        {children}
      </main>
    </div>
  );
}
