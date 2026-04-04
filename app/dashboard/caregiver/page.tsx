import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function CaregiverDashboard() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;

  let fullName = "";
  let isApproved = false;
  let matchesCount = 0;
  let caregiverProfileExists = false;

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();
    fullName = profile?.full_name || "";

    const { data: caregiverProfile } = await supabase
      .from("caregivers")
      .select("id, is_approved")
      .eq("user_id", userId)
      .single();

    if (caregiverProfile) {
      caregiverProfileExists = true;
      isApproved = caregiverProfile.is_approved;

      if (isApproved) {
        const { count } = await supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("caregiver_id", caregiverProfile.id);
        matchesCount = count ?? 0;
      }
    }
  }

  // ── PENDING APPROVAL ──────────────────────────────────────────────────────
  if (!isApproved) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1
            className="text-[#2F3E4E] text-[32px] md:text-[40px] font-semibold leading-[120%]"
            style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
          >
            Welcome{fullName ? `, ${fullName.split(" ")[0]}` : ""}! 🐾
          </h1>
          <p className="text-gray-500 text-[16px] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
            Your care provider journey starts here
          </p>
        </div>

        {/* Pending approval card */}
        <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-5 max-w-lg mx-auto w-full">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-3xl">
            🕐
          </div>
          <div>
            <h2
              className="text-[#2F3E4E] text-xl font-semibold mb-2"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              Application Under Review
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              {caregiverProfileExists
                ? "Your profile is currently under review. Our team will notify you once you're approved to start receiving dog matches."
                : "Please complete your care provider profile below. Once submitted, our team will review and approve your application."}
            </p>
          </div>

          {/* Steps */}
          <div className="w-full bg-[#F6F2EA] rounded-xl px-5 py-4 text-left">
            <div className="flex flex-col gap-3">
              {[
                { label: "Account created", done: true },
                { label: "Email verified", done: true },
                { label: "Profile completed", done: caregiverProfileExists },
                { label: "Application approved", done: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                      item.done
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    {item.done ? "✓" : "·"}
                  </div>
                  <p
                    className={`text-sm ${item.done ? "text-[#2F3E4E] font-medium" : "text-gray-400"}`}
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {!caregiverProfileExists && (
            <Link
              href="/dashboard/caregiver/profile"
              className="w-full h-11 flex items-center justify-center bg-[#5F7E9D] text-white font-medium text-[15px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Complete Your Profile →
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ── APPROVED DASHBOARD ────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8">
      {/* Welcome header */}
      <div>
        <h1
          className="text-center font-modern text-[#260900] text-[24px] md:text-[40px] font-semibold leading-[120%]"
        >
          Welcome back{fullName ? `, ${fullName.split(" ")[0]}` : ""}! 🐾
        </h1>
        <p className="text-[#6B7280] text-center text-[16px] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
          Here&apos;s your care provider overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Dog Matches", value: matchesCount, icon: "💛" },
          { label: "Active Requests", value: 0, icon: "📬" },
          { label: "Profile Views", value: 0, icon: "👁" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-[#F6F2EA] flex items-center justify-center text-2xl flex-shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="font-modern text-[#260900] text-sm">
                {stat.label}
              </p>
              <p
                className="text-[#6B7280] text-3xl font-semibold font-inter"
              >
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* View matches */}
        <div className="bg-[#260900] rounded-2xl p-8 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            💛
          </div>
          <div>
            <h2
              className="text-white text-xl font-semibold font-inter"
               
            >
              Your Dog Matches
            </h2>
            <p className="text-white/80 text-sm mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
              See dogs that are compatible with your availability, location, and experience
            </p>
          </div>
          <Link
            href="/dashboard/caregiver/matches"
            className="mt-auto inline-flex items-center justify-center h-11 px-6 bg-[#F3B443] text-[#fff] font-medium text-[15px] rounded-[10px] border-2 border-transparent hover:bg-transparent hover:text[#F3B443] hover:border-[#F3B443] transition-all duration-300 w-fit"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            View Matches →
          </Link>
        </div>

        {/* Edit profile */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F6F2EA] flex items-center justify-center text-2xl">
            ✏️
          </div>
          <div>
            <h2
              className="text-[#2F3E4E] text-xl font-semibold"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              Update Your Profile
            </h2>
            <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
              Keep your services, availability, and experience up to date for better matches
            </p>
          </div>
          <Link
            href="/dashboard/caregiver/profile"
            className="mt-auto inline-flex items-center justify-center h-11 px-6 bg-[#5F7E9D] text-white font-medium text-[15px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300 w-fit"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Edit Profile →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CaregiverDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-8 animate-pulse">
          <div className="h-12 w-72 bg-white/60 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/60 rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <CaregiverDashboard />
    </Suspense>
  );
}
