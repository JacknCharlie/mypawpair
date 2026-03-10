import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AddDogForm } from "@/components/add-dog-form";

export const dynamic = "force-dynamic";

export default async function AddDogPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub as string;

  return (
    <div className="flex flex-col gap-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400" style={{ fontFamily: "Inter, sans-serif" }}>
        <a href="/dashboard/owner" className="hover:text-[#5F7E9D] transition-colors">Dashboard</a>
        <span>›</span>
        <a href="/dashboard/owner/dogs" className="hover:text-[#5F7E9D] transition-colors">My Dogs</a>
        <span>›</span>
        <span className="text-[#2F3E4E]">Add Dog</span>
      </div>

      {/* Centered heading */}
      <div className="text-center max-w-xl mx-auto">
        <h1
          className="text-[#2F3E4E] text-[32px] font-semibold leading-[120%]"
          style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
        >
          Add Your Dog 🐶
        </h1>
        <p className="text-gray-500 text-[16px] mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
          Tell us about your dog so we can find the best caregiver match
        </p>
      </div>

      <AddDogForm ownerId={userId} />
    </div>
  );
}
