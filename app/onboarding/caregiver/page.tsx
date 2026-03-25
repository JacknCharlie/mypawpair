import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CaregiverProfileForm } from "@/components/caregiver-profile-form";

export const dynamic = "force-dynamic";

const STEPS = [
  { num: 1, label: "Account created", active: false, done: true },
  { num: 2, label: "Complete profile", active: true, done: false },
  { num: 3, label: "Under review", active: false, done: false },
  { num: 4, label: "Start matching", active: false, done: false },
];

export default async function CaregiverOnboardingPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub as string;

  // Verify user is a caregiver
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .single();

  if (profile?.role === "owner") redirect("/dashboard/owner");

  // If profile already complete, skip onboarding
  const { data: existingProfile } = await supabase
    .from("caregivers")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (existingProfile) redirect("/dashboard/caregiver");

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-[#F6F2EA]">
      {/* Minimal header */}
      <header className="w-full bg-[#F6F2EA] border-b border-black/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between py-5">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="myPawPair"
                width={200}
                height={50}
                className="h-11 w-auto"
                priority
              />
            </Link>
            <span
              className="bg-[#5F7E9D]/10 text-[#5F7E9D] text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Step 2 of 4
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Progress tracker */}
        <div className="flex items-start justify-between mb-10 relative px-4">
          {/* Background connector */}
          <div className="absolute top-5 left-4 right-4 h-0.5 bg-gray-200 z-0" />
          {/* Active connector — covers first step to second */}
          <div
            className="absolute top-5 left-4 h-0.5 bg-[#5F7E9D] z-0"
            style={{ width: "calc(25% - 0px)" }}
          />
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex flex-col items-center gap-2 z-10 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                  s.done
                    ? "bg-[#5F7E9D] border-[#5F7E9D] text-white"
                    : s.active
                    ? "bg-white border-[#5F7E9D] text-[#5F7E9D] shadow-md"
                    : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                {s.done ? "✓" : s.num}
              </div>
              <span
                className={`text-xs font-medium text-center hidden sm:block leading-tight max-w-[80px] ${
                  s.done || s.active ? "text-[#2F3E4E]" : "text-gray-400"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Welcome banner */}
        <div className="bg-gradient-to-br from-[#5F7E9D] to-[#4a6a8a] rounded-2xl p-8 mb-8 flex flex-col sm:flex-row items-start gap-5 shadow-sm">
          <div className="text-5xl">🐾</div>
          <div>
            <h1
              className="text-white text-[28px] font-semibold leading-[130%] mb-2"
              style={{
                fontFamily:
                  "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif",
              }}
            >
              Welcome to myPawPair, {firstName}!
            </h1>
            <p
              className="text-white/80 text-[15px] leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Your account is confirmed. Now let&apos;s build your care provider
              profile so our team can review your application and start matching
              you with dogs near you.
            </p>
          </div>
        </div>

        {/* Quick tips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { icon: "⏱️", text: "Takes about 5 minutes" },
            { icon: "✏️", text: "You can edit anytime" },
            { icon: "🔒", text: "Only shared after approval" },
          ].map((tip) => (
            <div
              key={tip.text}
              className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-100 shadow-sm"
            >
              <span className="text-xl">{tip.icon}</span>
              <p
                className="text-[#2F3E4E] text-sm font-medium"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {tip.text}
              </p>
            </div>
          ))}
        </div>

        {/* Profile form */}
        <CaregiverProfileForm userId={userId} existingProfile={null} />

        <p
          className="text-center text-xs text-gray-400 mt-6 pb-10"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          You can also{" "}
          <Link
            href="/dashboard/caregiver"
            className="text-[#5F7E9D] hover:underline"
          >
            skip for now
          </Link>{" "}
          and complete your profile later from your dashboard.
        </p>
      </main>
    </div>
  );
}
