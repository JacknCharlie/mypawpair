import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CaregiverProfileForm } from "@/components/caregiver-profile-form";

export const dynamic = "force-dynamic";

export default async function CaregiverProfilePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub as string;

  const { data: existingProfile } = await supabase
    .from("caregivers")
    .select("id, bio, experience_years, accepts_sizes, accepts_temperaments, services, certifications, city, zip_code, availability, is_approved")
    .eq("user_id", userId)
    .single();

  const isEditing = !!existingProfile;

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400" style={{ fontFamily: "Inter, sans-serif" }}>
        <Link href="/dashboard/caregiver" className="hover:text-[#5F7E9D] transition-colors">
          Dashboard
        </Link>
        <span>›</span>
        <span className="text-[#2F3E4E]">{isEditing ? "Edit Profile" : "Complete Profile"}</span>
      </div>

      {/* Centered heading */}
      <div className="text-center max-w-xl mx-auto">
        <h1
          className="text-[#2F3E4E] text-[32px] font-semibold leading-[120%]"
          style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
        >
          {isEditing ? "Update Your Profile ✏️" : "Complete Your Profile 🐾"}
        </h1>
        <p className="text-gray-500 text-[16px] mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
          {isEditing
            ? "Keep your profile up to date for better matches"
            : "Tell us about yourself so we can match you with the right dogs"}
        </p>

        {/* Approval notice */}
        {existingProfile && !existingProfile.is_approved && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 text-left">
            <span className="text-amber-500 text-lg mt-0.5">🕐</span>
            <p className="text-amber-700 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Your application is currently under review. Updating your profile will not affect your approval status.
            </p>
          </div>
        )}
      </div>

      <CaregiverProfileForm userId={userId} existingProfile={existingProfile} />
    </div>
  );
}
