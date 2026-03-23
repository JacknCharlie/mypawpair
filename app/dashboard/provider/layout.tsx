import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProviderSidebar } from "@/components/provider/provider-sidebar";
import { ProviderTopbar } from "@/components/provider/provider-topbar";
import { ProviderBottomNav } from "@/components/provider/provider-bottom-nav";

export const dynamic = "force-dynamic";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    redirect("/auth/login");
  }

  const userId = claimsData.claims.sub as string;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "provider") {
    redirect(
      profile?.role === "admin"
        ? "/dashboard/admin"
        : profile?.role === "caregiver"
        ? "/dashboard/caregiver"
        : "/dashboard/owner"
    );
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!provider) {
    redirect("/onboarding/provider");
  }

  return (
    <div className="flex h-screen bg-[#F6F2EA] overflow-hidden">
      <ProviderSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <ProviderTopbar userName={profile?.full_name ?? "Provider"} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-6">
          {children}
        </main>
        <ProviderBottomNav />
      </div>
    </div>
  );
}
