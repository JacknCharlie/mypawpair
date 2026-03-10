import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TIER_CONFIG = {
  high:   { label: "High Match",   bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500" },
  medium: { label: "Good Match",   bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500" },
  low:    { label: "Low Match",    bg: "bg-gray-100",   text: "text-gray-600",   dot: "bg-gray-400"  },
};

const STATUS_CONFIG = {
  suggested: { label: "Suggested", bg: "bg-blue-50",   text: "text-blue-600"  },
  contacted: { label: "Contacted", bg: "bg-purple-50", text: "text-purple-600" },
  accepted:  { label: "Accepted",  bg: "bg-green-50",  text: "text-green-600" },
  rejected:  { label: "Rejected",  bg: "bg-red-50",    text: "text-red-500"   },
};

export default async function OwnerMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ dog?: string }>;
}) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims) redirect("/auth/login");

  const userId = claimsData.claims.sub as string;
  const { dog: selectedDogId } = await searchParams;

  // Get owner's dogs for the filter tab
  const { data: dogs } = await supabase
    .from("dogs")
    .select("id, name, breed")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });

  if (!dogs || dogs.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
            <Link href="/dashboard/owner" className="hover:text-[#5F7E9D] transition-colors">Dashboard</Link>
            <span>›</span>
            <span className="text-[#2F3E4E]">Matches</span>
          </div>
          <h1 className="text-[#2F3E4E] text-[32px] font-semibold" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
            Caregiver Matches
          </h1>
        </div>
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#F6F2EA] flex items-center justify-center text-3xl">🔍</div>
          <div>
            <h2 className="text-[#2F3E4E] text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
              No dogs added yet
            </h2>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Add your dog first to see caregiver matches
            </p>
          </div>
          <Link href="/dashboard/owner/dogs/add" className="mt-2 px-8 py-3 bg-[#5F7E9D] text-white font-medium text-[15px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300" style={{ fontFamily: "Inter, sans-serif" }}>
            Add Your Dog
          </Link>
        </div>
      </div>
    );
  }

  // Active dog: from query param or first dog
  const activeDog = dogs.find((d) => d.id === selectedDogId) ?? dogs[0];

  // Fetch matches for the active dog — join caregivers and profiles
  const { data: matchesRaw } = await supabase
    .from("matches")
    .select(`
      id, total_score, compatibility_tier, match_status,
      location_score, size_score, temperament_score, availability_score, experience_score,
      caregivers (
        id, bio, experience_years, services, city, zip_code, availability,
        profiles ( full_name )
      )
    `)
    .eq("dog_id", activeDog.id);

  // Sort client-side by computed sum (generated columns can't always be ordered via PostgREST)
  const matches = matchesRaw
    ? [...matchesRaw].sort((a, b) => {
        const sumA = (a.location_score ?? 0) + (a.size_score ?? 0) + (a.temperament_score ?? 0) + (a.availability_score ?? 0) + (a.experience_score ?? 0);
        const sumB = (b.location_score ?? 0) + (b.size_score ?? 0) + (b.temperament_score ?? 0) + (b.availability_score ?? 0) + (b.experience_score ?? 0);
        return sumB - sumA;
      })
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
          <Link href="/dashboard/owner" className="hover:text-[#5F7E9D] transition-colors">Dashboard</Link>
          <span>›</span>
          <span className="text-[#2F3E4E]">Matches</span>
        </div>
        <h1 className="text-[#2F3E4E] text-[32px] font-semibold leading-[120%]" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
          Caregiver Matches 💛
        </h1>
        <p className="text-gray-500 text-[16px] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
          Caregivers matched to your dog based on compatibility
        </p>
      </div>

      {/* Dog tabs */}
      {dogs.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {dogs.map((dog) => (
            <Link
              key={dog.id}
              href={`/dashboard/owner/matches?dog=${dog.id}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                dog.id === activeDog.id
                  ? "bg-[#5F7E9D] text-white border-[#5F7E9D]"
                  : "bg-white text-[#2F3E4E] border-gray-200 hover:border-[#5F7E9D]"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              🐾 {dog.name}
            </Link>
          ))}
        </div>
      )}

      {/* No matches yet */}
      {(!matches || matches.length === 0) && (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#F6F2EA] flex items-center justify-center text-3xl">🔍</div>
          <div>
            <h2 className="text-[#2F3E4E] text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
              No matches yet for {activeDog.name}
            </h2>
            <p className="text-gray-500 text-sm max-w-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Matches are generated by our team once enough caregivers are in your area. Check back soon!
            </p>
          </div>
        </div>
      )}

      {/* Matches list */}
      {matches && matches.length > 0 && (
        <div className="flex flex-col gap-4">
          {matches.map((match) => {
            const caregiver = (match.caregivers as unknown) as {
              id: string; bio: string | null; experience_years: number | null;
              services: string[] | null; city: string | null; availability: string | null;
              profiles: { full_name: string | null } | null;
            } | null;
            if (!caregiver) return null;

            const tier = TIER_CONFIG[match.compatibility_tier as keyof typeof TIER_CONFIG] ?? TIER_CONFIG.low;
            const status = STATUS_CONFIG[match.match_status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.suggested;
            const name = caregiver.profiles?.full_name ?? "Caregiver";

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
                  <div className="w-14 h-14 rounded-full bg-[#5F7E9D] text-white text-xl font-semibold flex items-center justify-center flex-shrink-0">
                    {name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-1">
                      <h3 className="text-[#2F3E4E] text-lg font-semibold" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
                        {name}
                      </h3>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.bg} ${tier.text}`} style={{ fontFamily: "Inter, sans-serif" }}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${tier.dot} mr-1.5`} />
                        {tier.label}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.bg} ${status.text}`} style={{ fontFamily: "Inter, sans-serif" }}>
                        {status.label}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                      {caregiver.city && <span>📍 {caregiver.city}</span>}
                      {caregiver.experience_years != null && (
                        <span>⭐ {caregiver.experience_years} yr{caregiver.experience_years !== 1 ? "s" : ""} exp.</span>
                      )}
                      {caregiver.availability && <span>🕐 {caregiver.availability}</span>}
                    </div>

                    {caregiver.bio && (
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2" style={{ fontFamily: "Inter, sans-serif" }}>
                        {caregiver.bio}
                      </p>
                    )}

                    {/* Services */}
                    {caregiver.services && caregiver.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {caregiver.services.map((s) => (
                          <span key={s} className="text-xs bg-gray-50 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full capitalize" style={{ fontFamily: "Inter, sans-serif" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Score bar */}
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
                                className="h-full bg-[#5F7E9D] rounded-full transition-all"
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
