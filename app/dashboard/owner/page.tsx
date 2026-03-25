import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function OwnerGreeting() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;

  let fullName = "";
  let dogsCount = 0;
  let matchesCount = 0;
  let dogsList: {
    id: string; name: string; breed: string | null; size: string | null;
    age: number | null; energy_level: number | null; city: string | null;
    care_type: string[] | null; created_at: string;
  }[] = [];

  if (userId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();
    fullName = profile?.full_name || "";

    const { data: dogs, count: dogsC } = await supabase
      .from("dogs")
      .select("id, name, breed, size, age, energy_level, city, care_type, created_at", { count: "exact" })
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });
    dogsCount = dogsC ?? 0;
    dogsList = dogs ?? [];

    const { count: matches } = await supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .in(
        "dog_id",
        dogsList.map((d) => d.id)
      );
    matchesCount = matches ?? 0;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome header */}
      <div>
        <h1
          className="text-[#2F3E4E] text-[32px] md:text-[40px] font-semibold leading-[120%]"
          style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
        >
          Welcome{fullName ? `, ${fullName.split(" ")[0]}` : " back"}! 🐾
        </h1>
        <p className="text-gray-500 text-[16px] mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
          Find the perfect care provider for your dog
        </p>
        <Link
          href="/find-care"
          className="mt-4 inline-flex items-center gap-2 h-12 px-7 bg-[#5F7E9D] text-white font-medium text-[15px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          🔍 Find Care That Fits
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Dogs Registered", value: dogsCount, icon: "🐶" },
          { label: "Matches Found", value: matchesCount, icon: "💛" },
          { label: "Active Bookings", value: 0, icon: "📅" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-[#F6F2EA] flex items-center justify-center text-2xl flex-shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-400 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                {stat.label}
              </p>
              <p
                className="text-[#2F3E4E] text-3xl font-semibold"
                style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
              >
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add dog CTA */}
        <div className="bg-[#5F7E9D] rounded-2xl p-8 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            🐶
          </div>
          <div>
            <h2
              className="text-white text-xl font-semibold"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              Add Your Dog
            </h2>
            <p className="text-white/80 text-sm mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
              Create a profile for your dog to start getting matched with care providers
            </p>
          </div>
          <Link
            href="/dashboard/owner/dogs/add"
            className="mt-auto inline-flex items-center justify-center h-11 px-6 bg-white text-[#5F7E9D] font-medium text-[15px] rounded-[10px] border-2 border-transparent hover:bg-transparent hover:text-white hover:border-white transition-all duration-300 w-fit"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Add a Dog →
          </Link>
        </div>

        {/* Find care providers CTA */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F6F2EA] flex items-center justify-center text-2xl">
            🔍
          </div>
          <div>
            <h2
              className="text-[#2F3E4E] text-xl font-semibold"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              Find care providers
            </h2>
            <p className="text-gray-500 text-sm mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
              Browse care providers matched to your dog&apos;s energy, size, and temperament
            </p>
          </div>
          <div className="mt-auto flex gap-3 flex-wrap">
            <Link
              href="/find-care"
              className="inline-flex items-center justify-center h-11 px-6 bg-[#5F7E9D] text-white font-medium text-[15px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Start Quiz →
            </Link>
            <Link
              href="/dashboard/owner/matches"
              className="inline-flex items-center justify-center h-11 px-6 bg-white text-[#5F7E9D] font-medium text-[15px] rounded-[10px] border-2 border-[#5F7E9D]/30 hover:border-[#5F7E9D] transition-all duration-300"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              View Matches
            </Link>
          </div>
        </div>
      </div>

      {/* My Dogs table */}
      {dogsList.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div>
              <h2
                className="text-[#2F3E4E] text-lg font-semibold"
                style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
              >
                My Dogs
              </h2>
              <p className="text-gray-400 text-sm mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                {dogsList.length} dog{dogsList.length !== 1 ? "s" : ""} registered
              </p>
            </div>
            <Link
              href="/dashboard/owner/dogs/add"
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-[#5F7E9D] text-white text-sm font-medium rounded-[8px] hover:bg-[#4a6a8a] transition-colors"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              + Add Dog
            </Link>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Dog", "Size", "Age", "Energy", "City", "Care Needed", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-6 py-3"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dogsList.map((dog, i) => (
                  <tr
                    key={dog.id}
                    className={`hover:bg-[#F6F2EA]/50 transition-colors ${i !== dogsList.length - 1 ? "border-b border-gray-50" : ""}`}
                  >
                    {/* Dog name + breed */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#5F7E9D]/10 flex items-center justify-center text-lg flex-shrink-0">
                          🐾
                        </div>
                        <div>
                          <p className="text-[#2F3E4E] font-semibold text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                            {dog.name}
                          </p>
                          <p className="text-gray-400 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                            {dog.breed ?? "Mixed breed"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                        dog.size === "small"
                          ? "bg-green-50 text-green-700"
                          : dog.size === "medium"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                      }`} style={{ fontFamily: "Inter, sans-serif" }}>
                        {dog.size ?? "—"}
                      </span>
                    </td>

                    {/* Age */}
                    <td className="px-6 py-4">
                      <p className="text-[#2F3E4E] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                        {dog.age != null ? `${dog.age} yr${dog.age !== 1 ? "s" : ""}` : "—"}
                      </p>
                    </td>

                    {/* Energy */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <div
                              key={n}
                              className={`w-2 h-4 rounded-sm ${n <= (dog.energy_level ?? 0) ? "bg-[#5F7E9D]" : "bg-gray-200"}`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-400 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                          {dog.energy_level ?? "—"}/5
                        </span>
                      </div>
                    </td>

                    {/* City */}
                    <td className="px-6 py-4">
                      <p className="text-[#2F3E4E] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                        {dog.city ?? "—"}
                      </p>
                    </td>

                    {/* Care type */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {dog.care_type && dog.care_type.length > 0 ? (
                          dog.care_type.slice(0, 2).map((ct) => (
                            <span
                              key={ct}
                              className="inline-flex px-2 py-0.5 bg-[#F6F2EA] text-[#5F7E9D] text-xs rounded-md font-medium capitalize"
                              style={{ fontFamily: "Inter, sans-serif" }}
                            >
                              {ct}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                        {dog.care_type && dog.care_type.length > 2 && (
                          <span className="text-gray-400 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                            +{dog.care_type.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/owner/matches?dog=${dog.id}`}
                          className="inline-flex items-center h-8 px-3 bg-[#5F7E9D] text-white text-xs font-medium rounded-[6px] hover:bg-[#4a6a8a] transition-colors"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          Matches
                        </Link>
                        <Link
                          href="/find-care"
                          className="inline-flex items-center h-8 px-3 border border-gray-200 text-[#2F3E4E] text-xs font-medium rounded-[6px] hover:border-[#5F7E9D] hover:text-[#5F7E9D] transition-colors"
                          style={{ fontFamily: "Inter, sans-serif" }}
                        >
                          Quiz
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col divide-y divide-gray-50">
            {dogsList.map((dog) => (
              <div key={dog.id} className="px-5 py-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#5F7E9D]/10 flex items-center justify-center text-xl flex-shrink-0">
                  🐾
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#2F3E4E] font-semibold text-[15px]" style={{ fontFamily: "Inter, sans-serif" }}>
                    {dog.name}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5 truncate" style={{ fontFamily: "Inter, sans-serif" }}>
                    {[dog.breed ?? "Mixed breed", dog.size, dog.city].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <Link
                  href={`/dashboard/owner/matches?dog=${dog.id}`}
                  className="inline-flex items-center h-8 px-3 bg-[#5F7E9D] text-white text-xs font-medium rounded-[6px] flex-shrink-0"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Matches
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Getting started guide — shown when no dogs */}
      {dogsCount === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2
            className="text-[#2F3E4E] text-lg font-semibold mb-4"
            style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
          >
            Getting Started
          </h2>
          <div className="flex flex-col gap-4">
            {[
              {
                step: "1",
                title: "Add your dog",
                desc: "Tell us about your dog's breed, size, energy, and temperament",
                done: false,
              },
              {
                step: "2",
                title: "Get matched",
                desc: "Our algorithm finds care providers compatible with your dog",
                done: false,
              },
              {
                step: "3",
                title: "Connect & book",
                desc: "Reach out to your top matches and arrange care",
                done: false,
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#5F7E9D]/10 text-[#5F7E9D] text-sm font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <p
                    className="text-[#2F3E4E] font-medium text-sm"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {item.title}
                  </p>
                  <p className="text-gray-400 text-sm mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OwnerDashboardPage() {
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
      <OwnerGreeting />
    </Suspense>
  );
}
