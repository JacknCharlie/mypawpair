import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProviderProfileForm } from "@/components/provider-profile-form";

export const dynamic = "force-dynamic";

export default async function ProviderOnboardingPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub as string;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "provider" && profile?.role !== "admin") {
    redirect("/dashboard/owner");
  }

  const { data: existingProvider } = await supabase
    .from("providers")
    .select("id, business_name, description, category, city, zip_code, phone, website, email")
    .eq("user_id", userId)
    .single();

  if (existingProvider) redirect("/dashboard/provider");

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="min-h-screen bg-[#F6F2EA]">
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
              className="bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Step 2 of 3
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-gradient-to-br from-amber-500/20 to-[#5F7E9D]/20 rounded-2xl p-8 mb-8 flex flex-col sm:flex-row items-start gap-5 shadow-sm border border-amber-200/50">
          <div className="text-5xl">🏪</div>
          <div>
            <h1
              className="text-[#2F3E4E] text-[28px] font-semibold leading-[130%] mb-2"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              Welcome, {firstName}!
            </h1>
            <p
              className="text-gray-600 text-[15px] leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Complete your provider profile so dog owners can find and contact you. You&apos;ll be able to add your services from your dashboard next.
            </p>
          </div>
        </div>

        <ProviderProfileForm userId={userId} existingProfile={null} />
      </main>
    </div>
  );
}
