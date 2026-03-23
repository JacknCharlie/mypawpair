import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProviderProfileForm } from "@/components/provider-profile-form";

export const dynamic = "force-dynamic";

export default async function ProviderProfilePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub as string;

  const { data: provider } = await supabase
    .from("providers")
    .select("id, business_name, description, category, city, zip_code, phone, website, email")
    .eq("user_id", userId)
    .single();

  if (!provider) redirect("/onboarding/provider");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[#2F3E4E]" style={{ fontFamily: "Inter, sans-serif" }}>
          Edit Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
          Update your business info and contact details
        </p>
      </div>
      <ProviderProfileForm userId={userId} existingProfile={provider} />
    </div>
  );
}
