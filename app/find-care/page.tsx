import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { DogQuiz } from "@/components/dog-quiz";

export const dynamic = "force-dynamic";

export default async function FindCarePage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  // Logged in as caregiver → send to their dashboard
  let existingDogs: { id: string; name: string; breed: string | null; size: string | null }[] = [];
  if (claimsData?.claims) {
    const userId = claimsData.claims.sub as string;
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (profile?.role === "caregiver") {
      redirect("/dashboard/caregiver");
    }

    // Fetch existing dogs for this owner
    const { data: dogs } = await supabase
      .from("dogs")
      .select("id, name, breed, size")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
    existingDogs = dogs ?? [];
  }

  const isLoggedIn = !!claimsData?.claims;

  return (
    <div className="min-h-screen bg-[#F6F2EA]">
      {/* Header */}
      <header className="w-full bg-[#F6F2EA] border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/">
              <Image src="/logo.png" alt="myPawPair" width={200} height={50} className="h-12 w-auto" priority />
            </Link>
            {!isLoggedIn ? (
              <Link
                href="/auth/login"
                className="text-[#5F7E9D] text-sm font-medium hover:underline"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Already have an account? Sign in
              </Link>
            ) : (
              <Link
                href="/dashboard/owner"
                className="text-[#5F7E9D] text-sm font-medium hover:underline"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                ← Back to Dashboard
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* ── Not logged in — show sign-up gate ────────────────────────── */}
        {!isLoggedIn && (
          <div className="flex flex-col gap-8">
            {/* Hero text */}
            <div className="text-center">
              <div className="text-5xl mb-4">🐾</div>
              <h1
                className="text-[#2F3E4E] text-[36px] font-semibold mb-3"
                style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
              >
                Find the perfect care provider for your dog
              </h1>
              <p className="text-gray-500 text-[16px] leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                Answer a few quick questions about your dog and we&apos;ll match you with
                trusted care providers based on compatibility — size, energy, temperament, and location.
              </p>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2
                className="text-[#2F3E4E] text-lg font-semibold mb-4"
                style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
              >
                How it works
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  { step: "1", title: "Tell us about your dog",        desc: "Breed, size, energy, personality — takes 2 min" },
                  { step: "2", title: "We run a compatibility check",   desc: "Our algorithm scores care providers across 5 dimensions" },
                  { step: "3", title: "See your matches",               desc: "View ranked care providers with detailed compatibility scores" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#5F7E9D] text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-[#2F3E4E] font-medium text-sm" style={{ fontFamily: "Inter, sans-serif" }}>{item.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col gap-3">
              <Link
                href="/auth/sign-up"
                className="w-full h-13 py-4 flex items-center justify-center bg-[#5F7E9D] text-white font-medium text-[17px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Create Free Account & Start Quiz →
              </Link>
              <Link
                href="/auth/login"
                className="w-full py-3 flex items-center justify-center text-[#5F7E9D] font-medium text-[15px] rounded-[10px] border-2 border-[#5F7E9D] hover:bg-[#5F7E9D] hover:text-white transition-all duration-300"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Sign In to Continue
              </Link>
            </div>
          </div>
        )}

        {/* ── Logged in as owner — show quiz ───────────────────────────── */}
        {isLoggedIn && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1
                className="text-[#2F3E4E] text-[36px] font-semibold mb-2"
                style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
              >
                Let&apos;s find care that fits 🐾
              </h1>
              <p className="text-gray-500 text-[16px]" style={{ fontFamily: "Inter, sans-serif" }}>
                Answer 7 quick questions and we&apos;ll match your dog with the right care provider
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <DogQuiz existingDogs={existingDogs} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
