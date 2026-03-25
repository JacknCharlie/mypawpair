"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitQuizAndMatch, rematchExistingDog, type QuizData, type MatchResult } from "@/app/actions/quiz";

export interface ExistingDog {
  id: string;
  name: string;
  breed: string | null;
  size: string | null;
}

const TOTAL_STEPS = 7;

const TEMPERAMENT_OPTIONS = [
  { value: "friendly",   label: "Friendly",   emoji: "😊" },
  { value: "calm",       label: "Calm",        emoji: "😌" },
  { value: "anxious",    label: "Anxious",     emoji: "😟" },
  { value: "playful",    label: "Playful",     emoji: "🎾" },
  { value: "energetic",  label: "Energetic",   emoji: "⚡" },
  { value: "protective", label: "Protective",  emoji: "🛡️" },
  { value: "gentle",     label: "Gentle",      emoji: "🌸" },
  { value: "social",     label: "Social",      emoji: "🐶" },
  { value: "curious",    label: "Curious",     emoji: "🔍" },
  { value: "mouthy",     label: "Mouthy",      emoji: "👄" },
  { value: "loyal",      label: "Loyal",       emoji: "💛" },
];

const CARE_TYPE_OPTIONS = [
  { value: "boarding",  label: "Boarding",       emoji: "🏠", desc: "Stays with care provider" },
  { value: "daycare",   label: "Daycare",         emoji: "☀️", desc: "Drop off during day" },
  { value: "walking",   label: "Dog Walking",     emoji: "🦮", desc: "Daily walks" },
  { value: "drop-in",   label: "Drop-in Visit",   emoji: "🚪", desc: "Care provider visits home" },
];

const AVAILABILITY_OPTIONS = [
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "anytime",  label: "Anytime" },
  { value: "mornings", label: "Mornings" },
  { value: "evenings", label: "Evenings" },
];

const ENERGY_CONFIG = [
  { level: 1, emoji: "😴", label: "Very Low",  desc: "Loves naps, short walks" },
  { level: 2, emoji: "🐢", label: "Low",        desc: "Calm, easy-going" },
  { level: 3, emoji: "🐕", label: "Medium",     desc: "Balanced, playful" },
  { level: 4, emoji: "🏃", label: "High",       desc: "Active, needs exercise" },
  { level: 5, emoji: "🚀", label: "Very High",  desc: "Zoomies all day!" },
];

const TIER_CONFIG = {
  high:   { label: "High Match",  bg: "bg-green-100", text: "text-green-700", bar: "bg-green-500",  dot: "bg-green-500" },
  medium: { label: "Good Match",  bg: "bg-amber-100", text: "text-amber-700", bar: "bg-amber-500",  dot: "bg-amber-500" },
  low:    { label: "Low Match",   bg: "bg-gray-100",  text: "text-gray-500",  bar: "bg-gray-400",   dot: "bg-gray-400"  },
};

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400" style={{ fontFamily: "Inter, sans-serif" }}>
          Step {step} of {TOTAL_STEPS}
        </span>
        <span className="text-xs text-[#5F7E9D] font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>
          {Math.round((step / TOTAL_STEPS) * 100)}% complete
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#5F7E9D] rounded-full transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  );
}

function NavButtons({
  step,
  onBack,
  onNext,
  onSubmit,
  isLoading,
  canNext,
}: {
  step: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  canNext: boolean;
}) {
  return (
    <div className="flex items-center justify-between mt-8">
      {step > 1 ? (
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-gray-500 text-[15px] font-medium hover:text-[#2F3E4E] transition-colors"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          ← Back
        </button>
      ) : (
        <div />
      )}
      {step < TOTAL_STEPS ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="px-8 py-3 bg-[#5F7E9D] text-white font-medium text-[15px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Continue →
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !canNext}
          className="px-8 py-3 bg-[#5F7E9D] text-white font-medium text-[15px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {isLoading ? "Finding matches..." : "Find My Matches 🐾"}
        </button>
      )}
    </div>
  );
}

const SIZE_LABELS: Record<string, string> = { small: "Small 🐩", medium: "Medium 🐕", large: "Large 🦴" };

export function DogQuiz({ existingDogs = [] }: { existingDogs?: ExistingDog[] }) {
  const router = useRouter();
  // "choose" | "new" | number (step 1-7)
  const [mode, setMode] = useState<"choose" | "new" | number>(
    existingDogs.length > 0 ? "choose" : 1
  );
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchResult[] | null>(null);
  const [dogId, setDogId] = useState<string | null>(null);
  const [selectedExistingDog, setSelectedExistingDog] = useState<ExistingDog | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [size, setSize] = useState<"small" | "medium" | "large" | "">("");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [temperament, setTemperament] = useState<string[]>([]);
  const [specialNeeds, setSpecialNeeds] = useState(false);
  const [specialNotes, setSpecialNotes] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [careType, setCareType] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");

  const toggleTag = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const canNext = (): boolean => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return !!size;
    if (step === 5) return careType.length > 0;
    return true;
  };

  const handleNext = () => { if (canNext()) setStep((s) => s + 1); };
  const handleBack = () => {
    if (step === 1 && existingDogs.length > 0) { setMode("choose"); return; }
    setStep((s) => s - 1);
  };

  const handleRematch = async (dog: ExistingDog) => {
    setSelectedExistingDog(dog);
    setIsLoading(true);
    setError(null);
    const result = await rematchExistingDog(dog.id);
    setIsLoading(false);
    if (!result.success) { setError(result.error ?? "Something went wrong."); return; }
    setDogId(result.dogId ?? null);
    setMatches(result.matches ?? []);
  };

  const handleSubmit = async () => {
    if (!size) return;
    setIsLoading(true);
    setError(null);

    const quizData: QuizData = {
      name, breed, age, size,
      energy_level: energyLevel,
      temperament,
      special_needs: specialNeeds,
      special_notes: specialNotes,
      city, zip_code: zipCode,
      care_type: careType,
      availability,
    };

    const result = await submitQuizAndMatch(quizData);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error ?? "Something went wrong. Please try again.");
      return;
    }
    setDogId(result.dogId ?? null);
    setMatches(result.matches ?? []);
  };

  const dogName = name || "your dog";

  // ── LOADING (rematch) ────────────────────────────────────────────────────
  if (isLoading && selectedExistingDog) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="text-6xl animate-bounce">🐾</div>
        <div className="text-center">
          <h2 className="text-[#2F3E4E] text-2xl font-semibold mb-2" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
            Refreshing matches for {selectedExistingDog.name}...
          </h2>
          <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>Scoring care providers based on compatibility</p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-[#5F7E9D] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    );
  }

  // ── CHOOSE MODE (existing dogs) ───────────────────────────────────────────
  if (mode === "choose") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-[#2F3E4E] text-[28px] font-semibold mb-1" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
            Which dog needs care? 🐾
          </h2>
          <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            Select an existing dog to refresh their matches, or add a new one
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {existingDogs.map((dog) => (
            <button
              key={dog.id}
              type="button"
              onClick={() => handleRematch(dog)}
              className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-gray-200 hover:border-[#5F7E9D] transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-[#F6F2EA] flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-[#5F7E9D]/10">
                🐾
              </div>
              <div className="flex-1">
                <p className="text-[#2F3E4E] font-semibold text-[16px]" style={{ fontFamily: "Inter, sans-serif" }}>{dog.name}</p>
                <p className="text-gray-400 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                  {[dog.breed, dog.size ? SIZE_LABELS[dog.size] : null].filter(Boolean).join(" · ") || "Mixed breed"}
                </p>
              </div>
              <span className="text-[#5F7E9D] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ fontFamily: "Inter, sans-serif" }}>
                Refresh matches →
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={() => { setMode("new"); setStep(1); }}
          className="flex items-center justify-center gap-3 p-5 rounded-2xl border-2 border-dashed border-[#5F7E9D]/40 hover:border-[#5F7E9D] hover:bg-[#5F7E9D]/5 transition-all"
        >
          <span className="text-2xl">➕</span>
          <div className="text-left">
            <p className="text-[#5F7E9D] font-semibold text-[15px]" style={{ fontFamily: "Inter, sans-serif" }}>Add a new dog</p>
            <p className="text-gray-400 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>Fill out the quiz for a different dog</p>
          </div>
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600" style={{ fontFamily: "Inter, sans-serif" }}>{error}</p>
          </div>
        )}
      </div>
    );
  }

  // ── RESULTS VIEW ─────────────────────────────────────────────────────────
  if (matches !== null) {
    return (
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2
            className="text-[#2F3E4E] text-[32px] font-semibold"
            style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
          >
            {matches.length > 0
              ? `We found ${matches.length} match${matches.length !== 1 ? "es" : ""} for ${name}!`
              : `Profile saved for ${name}!`}
          </h2>
          <p className="text-gray-500 text-[16px] mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
            {matches.length > 0
              ? "Here are the most compatible care providers based on your dog's profile"
              : "We'll notify you as soon as care providers in your area are available"}
          </p>
        </div>

        {/* No matches */}
        {matches.length === 0 && (
          <div className="bg-white rounded-2xl p-10 border border-gray-100 shadow-sm flex flex-col items-center text-center gap-4">
            <div className="text-4xl">🔍</div>
            <p className="text-gray-500 text-sm max-w-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              No approved care providers in your area yet. We&apos;re growing fast — check back soon!
            </p>
            <button
              onClick={() => router.push("/dashboard/owner")}
              className="px-8 py-3 bg-[#5F7E9D] text-white font-medium rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Matches */}
        {matches.length > 0 && (
          <>
            <div className="flex flex-col gap-4">
              {matches.slice(0, 5).map((m) => {
                const tier = TIER_CONFIG[m.compatibility_tier];
                const initials = m.caregiver_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
                const scoreBreakdown = [
                  { label: "Location",    score: m.location_score },
                  { label: "Size",        score: m.size_score },
                  { label: "Temperament", score: m.temperament_score },
                  { label: "Availability",score: m.availability_score },
                  { label: "Experience",  score: m.experience_score },
                ];

                return (
                  <div key={m.caregiver_id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-[#5F7E9D] text-white text-lg font-semibold flex items-center justify-center flex-shrink-0">
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + tier */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3
                            className="text-[#2F3E4E] text-lg font-semibold"
                            style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
                          >
                            {m.caregiver_name}
                          </h3>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.bg} ${tier.text}`}
                            style={{ fontFamily: "Inter, sans-serif" }}
                          >
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${tier.dot} mr-1.5`} />
                            {tier.label}
                          </span>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                          {m.city && <span>📍 {m.city}</span>}
                          {m.experience_years != null && (
                            <span>⭐ {m.experience_years} yr{m.experience_years !== 1 ? "s" : ""} exp.</span>
                          )}
                          {m.availability && <span>🕐 {m.availability}</span>}
                        </div>

                        {m.bio && (
                          <p className="text-gray-500 text-sm mb-3 line-clamp-2" style={{ fontFamily: "Inter, sans-serif" }}>
                            {m.bio}
                          </p>
                        )}

                        {/* Services */}
                        {m.services && m.services.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {m.services.map((s) => (
                              <span key={s} className="text-xs bg-gray-50 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full capitalize" style={{ fontFamily: "Inter, sans-serif" }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Score breakdown */}
                        <div className="bg-[#F6F2EA] rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-[#2F3E4E]" style={{ fontFamily: "Inter, sans-serif" }}>
                              Compatibility
                            </span>
                            <span className="text-base font-bold text-[#5F7E9D]" style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}>
                              {m.total_score}/25
                            </span>
                          </div>
                          <div className="flex gap-1 mb-1">
                            {Array.from({ length: 25 }).map((_, i) => (
                              <div
                                key={i}
                                className={`flex-1 h-2 rounded-full ${i < m.total_score ? "bg-[#5F7E9D]" : "bg-gray-200"}`}
                              />
                            ))}
                          </div>
                          <div className="grid grid-cols-5 gap-1 mt-2">
                            {scoreBreakdown.map((s) => (
                              <div key={s.label} className="text-center">
                                <div className="text-xs font-semibold text-[#5F7E9D]">{s.score}/5</div>
                                <div className="text-[10px] text-gray-400" style={{ fontFamily: "Inter, sans-serif" }}>{s.label}</div>
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

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/dashboard/owner/matches")}
                className="flex-1 py-3 bg-[#5F7E9D] text-white font-medium text-[15px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300 text-center"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                View All Matches →
              </button>
              <button
                onClick={() => router.push("/dashboard/owner")}
                className="flex-1 py-3 bg-white text-[#5F7E9D] font-medium text-[15px] rounded-[10px] border-2 border-[#5F7E9D] hover:bg-[#5F7E9D] hover:text-white transition-all duration-300 text-center"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="text-6xl animate-bounce">🐾</div>
        <div className="text-center">
          <h2
            className="text-[#2F3E4E] text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
          >
            Finding the best matches for {name}...
          </h2>
          <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            Scoring care providers based on compatibility
          </p>
        </div>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-[#5F7E9D] animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── QUIZ STEPS ────────────────────────────────────────────────────────────
  return (
    <div>
      <ProgressBar step={step} />


      {/* ── Step 1: Name & Breed ─────────────────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div>
            <h2
              className="text-[#2F3E4E] text-[28px] font-semibold mb-1"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              Tell us about your dog 🐶
            </h2>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Start with the basics
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[#2F3E4E] text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                Dog&apos;s Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canNext() && handleNext()}
                placeholder="e.g. Bruno"
                className="h-12 rounded-xl border-2 border-gray-200 focus:border-[#5F7E9D] focus:outline-none px-4 text-[#2F3E4E] text-[16px]"
                style={{ fontFamily: "Inter, sans-serif" }}
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#2F3E4E] text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                Breed <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canNext() && handleNext()}
                placeholder="e.g. Labrador Retriever, Golden Mix..."
                className="h-12 rounded-xl border-2 border-gray-200 focus:border-[#5F7E9D] focus:outline-none px-4 text-[#2F3E4E] text-[16px]"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#2F3E4E] text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                Age <span className="text-gray-400 font-normal">(years, optional)</span>
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 3"
                className="h-12 rounded-xl border-2 border-gray-200 focus:border-[#5F7E9D] focus:outline-none px-4 text-[#2F3E4E] text-[16px] w-32"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Size ─────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div>
            <h2
              className="text-[#2F3E4E] text-[28px] font-semibold mb-1"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              How big is {dogName}? *
            </h2>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              This helps match care providers experienced with your dog&apos;s size
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { value: "small",  emoji: "🐩", label: "Small",  desc: "Under 10 kg" },
              { value: "medium", emoji: "🐕", label: "Medium", desc: "10–25 kg" },
              { value: "large",  emoji: "🦴", label: "Large",  desc: "25+ kg" },
            ].map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSize(s.value as "small" | "medium" | "large")}
                className={`flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                  size === s.value
                    ? "bg-[#5F7E9D] border-[#5F7E9D] text-white"
                    : "bg-white border-gray-200 text-[#2F3E4E] hover:border-[#5F7E9D]"
                }`}
              >
                <span className="text-4xl">{s.emoji}</span>
                <div className="text-center">
                  <p className="font-semibold text-[16px]" style={{ fontFamily: "Inter, sans-serif" }}>{s.label}</p>
                  <p className={`text-xs mt-0.5 ${size === s.value ? "text-white/70" : "text-gray-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                    {s.desc}
                  </p>
                </div>
                {size === s.value && <span className="text-white text-xl">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 3: Energy ───────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div>
            <h2
              className="text-[#2F3E4E] text-[28px] font-semibold mb-1"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              How energetic is {dogName}?
            </h2>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Care providers are matched based on your dog&apos;s energy level
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Energy cards */}
            <div className="grid grid-cols-5 gap-2">
              {ENERGY_CONFIG.map((e) => (
                <button
                  key={e.level}
                  type="button"
                  onClick={() => setEnergyLevel(e.level)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    energyLevel === e.level
                      ? "bg-[#5F7E9D] border-[#5F7E9D]"
                      : "bg-white border-gray-200 hover:border-[#5F7E9D]"
                  }`}
                >
                  <span className="text-2xl">{e.emoji}</span>
                  <span
                    className={`text-[11px] font-semibold text-center ${energyLevel === e.level ? "text-white" : "text-[#2F3E4E]"}`}
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {e.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected description */}
            <div className="bg-[#F6F2EA] rounded-xl px-5 py-4 flex items-center gap-4">
              <span className="text-4xl">{ENERGY_CONFIG[energyLevel - 1].emoji}</span>
              <div>
                <p className="text-[#2F3E4E] font-semibold text-[16px]" style={{ fontFamily: "Inter, sans-serif" }}>
                  {ENERGY_CONFIG[energyLevel - 1].label} Energy
                </p>
                <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                  {ENERGY_CONFIG[energyLevel - 1].desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4: Temperament ──────────────────────────────────────────── */}
      {step === 4 && (
        <div className="flex flex-col gap-6">
          <div>
            <h2
              className="text-[#2F3E4E] text-[28px] font-semibold mb-1"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              Describe {dogName}&apos;s personality
            </h2>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Select all that apply — this helps us find the right personality match
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {TEMPERAMENT_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleTag(temperament, t.value, setTemperament)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm transition-all ${
                  temperament.includes(t.value)
                    ? "bg-[#5F7E9D] text-white border-[#5F7E9D]"
                    : "bg-white text-[#2F3E4E] border-gray-200 hover:border-[#5F7E9D]"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {temperament.length > 0 && (
            <div className="bg-[#F6F2EA] rounded-xl px-4 py-3">
              <p className="text-sm text-[#2F3E4E]" style={{ fontFamily: "Inter, sans-serif" }}>
                Selected: <span className="font-semibold">{temperament.join(", ")}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 5: Care Type ────────────────────────────────────────────── */}
      {step === 5 && (
        <div className="flex flex-col gap-6">
          <div>
            <h2
              className="text-[#2F3E4E] text-[28px] font-semibold mb-1"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              What care does {dogName} need? *
            </h2>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Select all the services you&apos;re looking for
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CARE_TYPE_OPTIONS.map((ct) => (
              <button
                key={ct.value}
                type="button"
                onClick={() => toggleTag(careType, ct.value, setCareType)}
                className={`flex items-center gap-4 p-5 rounded-xl border-2 text-left transition-all ${
                  careType.includes(ct.value)
                    ? "bg-[#5F7E9D] border-[#5F7E9D]"
                    : "bg-white border-gray-200 hover:border-[#5F7E9D]"
                }`}
              >
                <span className="text-3xl">{ct.emoji}</span>
                <div className="flex-1">
                  <p className={`font-semibold text-[15px] ${careType.includes(ct.value) ? "text-white" : "text-[#2F3E4E]"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                    {ct.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${careType.includes(ct.value) ? "text-white/70" : "text-gray-400"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                    {ct.desc}
                  </p>
                </div>
                {careType.includes(ct.value) && <span className="text-white text-lg">✓</span>}
              </button>
            ))}
          </div>

          {/* Availability */}
          <div className="flex flex-col gap-2">
            <label className="text-[#2F3E4E] text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
              When do you need care?
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABILITY_OPTIONS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAvailability(availability === a.value ? "" : a.value)}
                  className={`px-4 py-2 rounded-full text-sm border-2 transition-all ${
                    availability === a.value
                      ? "bg-[#5F7E9D] text-white border-[#5F7E9D]"
                      : "bg-white text-[#2F3E4E] border-gray-200 hover:border-[#5F7E9D]"
                  }`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 6: Location ─────────────────────────────────────────────── */}
      {step === 6 && (
        <div className="flex flex-col gap-6">
          <div>
            <h2
              className="text-[#2F3E4E] text-[28px] font-semibold mb-1"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              Where are you located?
            </h2>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              We&apos;ll match {dogName} with care providers in your area
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[#2F3E4E] text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Bengaluru..."
                className="h-12 rounded-xl border-2 border-gray-200 focus:border-[#5F7E9D] focus:outline-none px-4 text-[#2F3E4E] text-[16px]"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[#2F3E4E] text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                Area / ZIP Code <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="e.g. 400001"
                className="h-12 rounded-xl border-2 border-gray-200 focus:border-[#5F7E9D] focus:outline-none px-4 text-[#2F3E4E] text-[16px] w-40"
                style={{ fontFamily: "Inter, sans-serif" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 7: Special Needs ────────────────────────────────────────── */}
      {step === 7 && (
        <div className="flex flex-col gap-6">
          <div>
            <h2
              className="text-[#2F3E4E] text-[28px] font-semibold mb-1"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              Any special requirements?
            </h2>
            <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
              Help care providers understand {dogName}&apos;s unique needs
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl border-2 border-gray-200 hover:border-[#5F7E9D] transition-colors">
              <div
                onClick={() => setSpecialNeeds(!specialNeeds)}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 flex-shrink-0 ${specialNeeds ? "bg-[#5F7E9D]" : "bg-gray-200"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${specialNeeds ? "translate-x-6" : "translate-x-0"}`} />
              </div>
              <div>
                <p className="text-[#2F3E4E] font-medium text-[15px]" style={{ fontFamily: "Inter, sans-serif" }}>
                  {dogName} has special needs or medical requirements
                </p>
                <p className="text-gray-400 text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                  Medication, allergies, behavioral needs, etc.
                </p>
              </div>
            </label>

            {specialNeeds && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[#2F3E4E] text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                  Please describe
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Takes anxiety medication twice a day, needs a quiet home environment..."
                  rows={4}
                  className="w-full rounded-xl border-2 border-gray-200 focus:border-[#5F7E9D] focus:outline-none px-4 py-3 text-sm text-[#2F3E4E] resize-none"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
              </div>
            )}

            {/* Summary card */}
            <div className="bg-[#F6F2EA] rounded-xl p-5">
              <p className="text-[#2F3E4E] text-sm font-semibold mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                {dogName}&apos;s profile summary
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-500" style={{ fontFamily: "Inter, sans-serif" }}>
                {breed && <span>🐕 {breed}</span>}
                {age && <span>📅 {age} year{parseInt(age) !== 1 ? "s" : ""} old</span>}
                {size && <span>📏 {size.charAt(0).toUpperCase() + size.slice(1)}</span>}
                <span>⚡ {ENERGY_CONFIG[energyLevel - 1].label} energy</span>
                {city && <span>📍 {city}</span>}
                {careType.length > 0 && <span>🏷️ {careType.join(", ")}</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600" style={{ fontFamily: "Inter, sans-serif" }}>{error}</p>
        </div>
      )}

      <NavButtons
        step={step}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        canNext={canNext()}
      />
    </div>
  );
}
