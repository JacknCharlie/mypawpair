import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AccountSettingsForm } from "@/components/account-settings-form";

export const dynamic = "force-dynamic";

export default async function CaregiverSettingsPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub as string;
  const email = claimsData.claims.email as string ?? "";

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, city")
    .eq("id", userId)
    .single();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2 text-sm text-[#6B7280]" style={{ fontFamily: "Inter, sans-serif" }}>
        <Link href="/dashboard/caregiver" className="hover:text-[#F3B443] transition-colors">Dashboard</Link>
        <span>›</span>
        <span className="text-[#2F3E4E]">Account Settings</span>
      </div>

      <div className="text-center max-w-xl mx-auto">
        <h1
          className="text-[#260900]  text-[24px] font-modern md:text-[32px] font-semibold leading-[120%]"
          style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
        >
          Account Settings ⚙️
        </h1>
        <p className="text-[#6B7280] text-[16px] mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
          Manage your profile and security settings
        </p>
      </div>

      <AccountSettingsForm
        userId={userId}
        email={email}
        fullName={profile?.full_name ?? ""}
        phone={profile?.phone ?? ""}
        city={profile?.city ?? ""}
      />
    </div>
  );
}
