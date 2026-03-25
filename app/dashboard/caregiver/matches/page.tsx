import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TIER_CONFIG = {
  high:   { label: "High Match",  bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  medium: { label: "Good Match",  bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  low:    { label: "Low Match",   bg: "bg-gray-100",  text: "text-gray-600",  dot: "bg-gray-400"  },
};

const SIZE_LABELS: Record<string, string> = { small: "Small 🐩", medium: "Medium 🐕", large: "Large 🦴" };
const ENERGY_LABELS = ["", "Very Low", "Low", "Medium", "High", "Very High"];

export default async function CaregiverMatchesPage() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub as string;

  // Get caregiver record
  const { data: caregiverProfile } = await supabase
    .from("caregivers")
    .select("id, is_approved")
    .eq("user_id", userId)
    .single();

  if (!caregiverProfile) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-[#2F3E4E] text-[32px] font-semibold" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
          My Matches
        </h1>
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#F6F2EA] flex items-center justify-center text-3xl">🐾</div>
          <div>
            <h2 className="text-[#2F3E4E] text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
              Complete your profile first
            </h2>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Set up your care provider profile to start receiving dog matches
            </p>
          </div>
          <Link href="/dashboard/caregiver/profile" className="mt-2 px-8 py-3 bg-[#5F7E9D] text-white font-medium text-[15px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300" style={{ fontFamily: "Inter, sans-serif" }}>
            Complete Profile
          </Link>
        </div>
      </div>
    );
  }

  // Fetch matches (show regardless of approval — pending caregivers can preview)
  const { data: matchesRaw } = await supabase
    .from("matches")
    .select(`
      id, total_score, compatibility_tier, match_status,
      location_score, size_score, temperament_score, availability_score, experience_score,
      dogs (
        id, name, breed, size, age, energy_level, temperament,
        special_needs, city, care_type, availability,
        profiles ( full_name )
      )
    `)
    .eq("caregiver_id", caregiverProfile.id);

  // Sort client-side to avoid issues with generated column ordering
  const matches = matchesRaw
    ? [...matchesRaw].sort((a, b) => {
        const sumA = (a.location_score ?? 0) + (a.size_score ?? 0) + (a.temperament_score ?? 0) + (a.availability_score ?? 0) + (a.experience_score ?? 0);
        const sumB = (b.location_score ?? 0) + (b.size_score ?? 0) + (b.temperament_score ?? 0) + (b.availability_score ?? 0) + (b.experience_score ?? 0);
        return sumB - sumA;
      })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
          <Link href="/dashboard/caregiver" className="hover:text-[#5F7E9D] transition-colors">Dashboard</Link>
          <span>›</span>
          <span className="text-[#2F3E4E]">My Matches</span>
        </div>
        <h1 className="text-[#2F3E4E] text-[32px] font-semibold leading-[120%]" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
          Dog Matches 💛
        </h1>
        <p className="text-gray-500 text-[16px] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
          Dogs matched to your services, availability, and preferences
        </p>
      </div>

      {(!matches || matches.length === 0) && (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#F6F2EA] flex items-center justify-center text-3xl">🔍</div>
          <div>
            <h2 className="text-[#2F3E4E] text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
              No matches yet
            </h2>
            <p className="text-gray-500 text-sm max-w-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Matches are generated as dog owners in your area register. Keep your profile updated for the best results.
            </p>
          </div>
          <Link href="/dashboard/caregiver/profile" className="mt-2 px-6 py-2.5 bg-[#5F7E9D] text-white text-sm font-medium rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300" style={{ fontFamily: "Inter, sans-serif" }}>
            Update Profile
          </Link>
        </div>
      )}

      {matches && matches.length > 0 && (
        <div className="flex flex-col gap-4">
          {matches.map((match) => {
            const dog = (match.dogs as unknown) as {
              id: string; name: string; breed: string | null; size: string | null;
              age: number | null; energy_level: number | null; temperament: string[] | null;
              special_needs: boolean; city: string | null; care_type: string[] | null;
              availability: string | null;
              profiles: { full_name: string | null } | null;
            } | null;
            if (!dog) return null;

            const tier = TIER_CONFIG[match.compatibility_tier as keyof typeof TIER_CONFIG] ?? TIER_CONFIG.low;
            const ownerName = dog.profiles?.full_name ?? "Dog Owner";

            const scoreBreakdown = [
              { label: "Location",     score: match.location_score },
              { label: "Size",         score: match.size_score },
              { label: "Temperament",  score: match.temperament_score },
              { label: "Availability", score: match.availability_score },
              { label: "Experience",   score: match.experience_score },
            ];

            return (
              <div key={match.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-[#F6F2EA] text-2xl flex items-center justify-center flex-shrink-0">
                    🐾
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <h3 className="text-[#2F3E4E] text-lg font-semibold" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
                        {dog.name}
                      </h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.bg} ${tier.text}`} style={{ fontFamily: "Inter, sans-serif" }}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${tier.dot} mr-1.5`} />
                        {tier.label}
                      </span>
                      {dog.special_needs && (
                        <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full" style={{ fontFamily: "Inter, sans-serif" }}>
                          Special needs
                        </span>
                      )}
                    </div>

                    <p className="text-gray-400 text-sm mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                      Owner: {ownerName}
                    </p>

                    {/* Dog tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {dog.breed && (
                        <span className="text-xs bg-gray-50 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full" style={{ fontFamily: "Inter, sans-serif" }}>
                          {dog.breed}
                        </span>
                      )}
                      {dog.size && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                          {SIZE_LABELS[dog.size]}
                        </span>
                      )}
                      {dog.energy_level && (
                        <span className="text-xs bg-[#5F7E9D]/10 text-[#5F7E9D] px-2.5 py-1 rounded-full font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                          ⚡ {ENERGY_LABELS[dog.energy_level]} energy
                        </span>
                      )}
                      {dog.city && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                          📍 {dog.city}
                        </span>
                      )}
                      {dog.age != null && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                          {dog.age} yr{dog.age !== 1 ? "s" : ""} old
                        </span>
                      )}
                    </div>

                    {/* Care needs */}
                    {dog.care_type && dog.care_type.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="text-xs text-gray-400 self-center" style={{ fontFamily: "Inter, sans-serif" }}>Needs:</span>
                        {dog.care_type.map((ct) => (
                          <span key={ct} className="text-xs bg-gray-50 border border-gray-200 text-gray-500 px-2.5 py-1 rounded-full capitalize" style={{ fontFamily: "Inter, sans-serif" }}>
                            {ct}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Score breakdown */}
                    <div className="bg-[#F6F2EA] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-[#2F3E4E]" style={{ fontFamily: "Inter, sans-serif" }}>
                          Compatibility Score
                        </span>
                        <span className="text-lg font-bold text-[#5F7E9D]" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
                          {match.total_score}/25
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {scoreBreakdown.map((s) => (
                          <div key={s.label} className="flex flex-col items-center gap-1">
                            <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#5F7E9D] rounded-full"
                                style={{ width: `${((s.score ?? 0) / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 text-center" style={{ fontFamily: "Inter, sans-serif" }}>
                              {s.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
