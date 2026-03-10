import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SIZE_LABELS: Record<string, string> = {
  small: "Small 🐩",
  medium: "Medium 🐕",
  large: "Large 🦴",
};

const ENERGY_LABELS = ["", "Very Low", "Low", "Medium", "High", "Very High"];

export default async function MyDogsPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub as string;

  const { data: dogs } = await supabase
    .from("dogs")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
            <Link href="/dashboard/owner" className="hover:text-[#5F7E9D] transition-colors">Dashboard</Link>
            <span>›</span>
            <span className="text-[#2F3E4E]">My Dogs</span>
          </div>
          <h1
            className="text-[#2F3E4E] text-[32px] font-semibold leading-[120%]"
            style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
          >
            My Dogs 🐶
          </h1>
          <p className="text-gray-500 text-[16px] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
            {dogs && dogs.length > 0
              ? `${dogs.length} dog${dogs.length > 1 ? "s" : ""} registered`
              : "No dogs added yet"}
          </p>
        </div>
        <Link
          href="/dashboard/owner/dogs/add"
          className="px-6 py-3 bg-[#5F7E9D] text-white font-medium text-[15px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300 flex-shrink-0"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          + Add Dog
        </Link>
      </div>

      {/* Empty state */}
      {(!dogs || dogs.length === 0) && (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#F6F2EA] flex items-center justify-center text-3xl">🐶</div>
          <div>
            <h2
              className="text-[#2F3E4E] text-xl font-semibold mb-1"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              No dogs yet
            </h2>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Add your dog&apos;s profile to start getting matched with caregivers
            </p>
          </div>
          <Link
            href="/dashboard/owner/dogs/add"
            className="mt-2 px-8 py-3 bg-[#5F7E9D] text-white font-medium text-[15px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Add Your First Dog
          </Link>
        </div>
      )}

      {/* Dogs grid */}
      {dogs && dogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {dogs.map((dog) => (
            <div
              key={dog.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4"
            >
              {/* Dog header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#F6F2EA] flex items-center justify-center text-2xl">
                    🐾
                  </div>
                  <div>
                    <h3
                      className="text-[#2F3E4E] text-lg font-semibold"
                      style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
                    >
                      {dog.name}
                    </h3>
                    <p className="text-gray-400 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                      {dog.breed || "Mixed breed"}{dog.age ? ` · ${dog.age} yr${dog.age > 1 ? "s" : ""}` : ""}
                    </p>
                  </div>
                </div>
                {dog.special_needs && (
                  <span
                    className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Special needs
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {dog.size && (
                  <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                    {SIZE_LABELS[dog.size]}
                  </span>
                )}
                {dog.energy_level && (
                  <span className="text-xs bg-[#5F7E9D]/10 text-[#5F7E9D] px-3 py-1 rounded-full font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                    ⚡ {ENERGY_LABELS[dog.energy_level]} energy
                  </span>
                )}
                {dog.city && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                    📍 {dog.city}
                  </span>
                )}
              </div>

              {/* Care types */}
              {dog.care_type && dog.care_type.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {dog.care_type.map((ct: string) => (
                    <span
                      key={ct}
                      className="text-xs bg-gray-50 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full capitalize"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {ct}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <Link
                  href={`/dashboard/owner/matches?dog=${dog.id}`}
                  className="flex-1 text-center py-2 bg-[#5F7E9D] text-white text-sm font-medium rounded-lg hover:bg-[#4e6d8a] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  View Matches
                </Link>
                <Link
                  href={`/dashboard/owner/dogs/${dog.id}/edit`}
                  className="flex-1 text-center py-2 bg-gray-50 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
