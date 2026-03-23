import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Briefcase, User, ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  grooming: "Grooming",
  training: "Training",
  vet: "Veterinary",
  walking: "Dog Walking",
  boarding: "Boarding",
  other: "Other",
};

export default async function ProviderDashboardPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub as string;

  const { data: provider } = await supabase
    .from("providers")
    .select("id, business_name, category, city, is_verified")
    .eq("user_id", userId)
    .single();

  if (!provider) redirect("/onboarding/provider");

  const { count: servicesCount } = await supabase
    .from("provider_services")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", provider.id)
    .eq("is_active", true);

  const { count: inquiriesCount } = await supabase
    .from("provider_inquiries")
    .select("id", { count: "exact", head: true })
    .eq("provider_id", provider.id)
    .eq("status", "pending");

  return (
    <div className="space-y-6 md:space-y-8" style={{ fontFamily: "Inter, sans-serif" }}>
      <div>
        <h1 className="text-2xl md:3xl font-semibold text-[#2F3E4E] tracking-tight">
          Welcome back!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here&apos;s an overview of your provider dashboard
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/dashboard/provider/services"
          className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-[#5F7E9D]/20 transition-all"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Services</p>
              <p className="text-2xl font-semibold text-[#2F3E4E] mt-1">
                {servicesCount ?? 0}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-[#5F7E9D] font-medium mt-2">Manage services</p>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Inquiries</p>
              <p className="text-2xl font-semibold text-[#2F3E4E] mt-1">
                {inquiriesCount ?? 0}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">From dog owners</p>
        </div>
      </div>

      {/* Business info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#2F3E4E] mb-4">Your Business</h2>
        <div className="space-y-2">
          <p className="text-[#2F3E4E] font-medium">{provider.business_name}</p>
          <p className="text-sm text-gray-500">
            {CATEGORY_LABELS[provider.category] ?? provider.category} • {provider.city}
          </p>
          {!provider.is_verified && (
            <p className="text-xs text-amber-600 mt-2">
              Your profile is pending verification. Once verified, you&apos;ll appear in the provider directory.
            </p>
          )}
        </div>
        <Link
          href="/dashboard/provider/profile"
          className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-[#5F7E9D] hover:underline"
        >
          <User className="h-4 w-4" />
          Edit profile
        </Link>
      </div>

      {/* Quick actions */}
      <div className="bg-[#F6F2EA] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-[#2F3E4E] mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/provider/services"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#2F3E4E] hover:border-[#5F7E9D] hover:bg-[#5F7E9D]/5 transition-colors"
          >
            <Briefcase className="h-4 w-4" />
            Add a service
          </Link>
          <Link
            href="/find-providers"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-[#2F3E4E] hover:border-[#5F7E9D] hover:bg-[#5F7E9D]/5 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View provider directory
          </Link>
        </div>
      </div>
    </div>
  );
}
