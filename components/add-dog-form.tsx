"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TEMPERAMENT_OPTIONS = [
  { value: "friendly",   label: "Friendly",   emoji: "😊" },
  { value: "calm",       label: "Calm",       emoji: "😌" },
  { value: "anxious",    label: "Anxious",    emoji: "😟" },
  { value: "playful",    label: "Playful",    emoji: "🎾" },
  { value: "energetic",  label: "Energetic",  emoji: "⚡" },
  { value: "protective", label: "Protective", emoji: "🛡️" },
  { value: "gentle",     label: "Gentle",     emoji: "🌸" },
  { value: "social",     label: "Social",     emoji: "🐶" },
  { value: "curious",    label: "Curious",    emoji: "🔍" },
  { value: "mouthy",     label: "Mouthy",     emoji: "👄" },
  { value: "loyal",      label: "Loyal",      emoji: "💛" },
];

const CARE_TYPE_OPTIONS = [
  { value: "boarding", label: "Boarding",       icon: "🏠", desc: "Stays with care provider" },
  { value: "daycare",  label: "Daycare",        icon: "☀️", desc: "Drop off during day" },
  { value: "walking",  label: "Dog Walking",    icon: "🦮", desc: "Daily walks" },
  { value: "drop-in",  label: "Drop-in Visit",  icon: "🚪", desc: "Care provider visits home" },
];

const AVAILABILITY_OPTIONS = [
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "anytime",  label: "Anytime" },
  { value: "mornings", label: "Mornings" },
  { value: "evenings", label: "Evenings" },
];

const STEPS = [
  { num: 1, title: "The Basics",    icon: "🐾", desc: "Name, breed & size" },
  { num: 2, title: "Personality",   icon: "✨", desc: "Energy & temperament" },
  { num: 3, title: "Care Needs",    icon: "📍", desc: "Location & services" },
  { num: 4, title: "Special Needs", icon: "💊", desc: "Medical info" },
];

const ENERGY_LABELS = ["", "Very Low", "Low", "Medium", "High", "Very High"];

export function AddDogForm({ ownerId }: { ownerId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [size, setSize] = useState<"small" | "medium" | "large" | "">("");

  // Step 2
  const [energyLevel, setEnergyLevel] = useState(3);
  const [temperament, setTemperament] = useState<string[]>([]);

  // Step 3
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [careType, setCareType] = useState<string[]>([]);
  const [availability, setAvailability] = useState("");

  // Step 4
  const [specialNeeds, setSpecialNeeds] = useState(false);
  const [specialNotes, setSpecialNotes] = useState("");

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((i) => i !== val) : [...arr, val]);

  const canNext = () => {
    if (step === 1) return name.trim().length > 0 && !!size;
    if (step === 3) return careType.length > 0;
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (!canNext()) {
      if (step === 1) setError("Please enter your dog's name and select a size");
      if (step === 3) setError("Please select at least one type of care needed");
      return;
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    const { error: insertError } = await supabase.from("dogs").insert({
      owner_id: ownerId,
      name,
      breed: breed || null,
      size,
      age: age ? parseInt(age) : null,
      energy_level: energyLevel,
      temperament: temperament.length > 0 ? temperament : null,
      special_needs: specialNeeds,
      special_notes: specialNotes || null,
      city: city || null,
      zip_code: zipCode || null,
      care_type: careType,
      availability: availability || null,
    });

    setIsLoading(false);
    if (insertError) { setError(insertError.message); return; }
    router.push("/dashboard/owner/dogs");
    router.refresh();
  };

  return (
    <div className="max-w-xl mx-auto w-full">

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-[#5F7E9D] z-0 transition-all duration-500"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2 z-10">
            <button
              type="button"
              onClick={() => { if (s.num < step) setStep(s.num); }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-base border-2 transition-all duration-300 ${
                s.num < step
                  ? "bg-[#5F7E9D] border-[#5F7E9D] text-white cursor-pointer"
                  : s.num === step
                  ? "bg-white border-[#5F7E9D] shadow-md text-[#5F7E9D] cursor-default"
                  : "bg-white border-gray-200 text-gray-400 cursor-default"
              }`}
            >
              {s.num < step ? "✓" : s.icon}
            </button>
            <span
              className={`text-xs font-medium hidden sm:block text-center max-w-[72px] leading-tight ${
                s.num <= step ? "text-[#2F3E4E]" : "text-gray-400"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-50">
          <p className="text-[#5F7E9D] text-xs font-semibold uppercase tracking-widest mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
            Step {step} of {STEPS.length}
          </p>
          <h2
            className="text-[#2F3E4E] text-[26px] font-semibold leading-tight"
            style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
          >
            {STEPS[step - 1].icon} {STEPS[step - 1].title}
          </h2>
          <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
            {STEPS[step - 1].desc}
          </p>
        </div>

        {/* Step content */}
        <div className="px-8 py-7">

          {/* ── Step 1: Basics ─────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[#2F3E4E] text-sm font-medium">Dog&apos;s Name *</Label>
                <Input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Bruno"
                  className="h-12 rounded-xl border-gray-200 focus:border-[#5F7E9D] text-[#2F3E4E] text-[15px]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[#2F3E4E] text-sm font-medium">Breed <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                  placeholder="e.g. Labrador Retriever"
                  className="h-12 rounded-xl border-gray-200 focus:border-[#5F7E9D] text-[#2F3E4E] text-[15px]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[#2F3E4E] text-sm font-medium">Age <span className="text-gray-400 font-normal">(years, optional)</span></Label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 3"
                  className="h-12 rounded-xl border-gray-200 focus:border-[#5F7E9D] text-[#2F3E4E] text-[15px]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[#2F3E4E] text-sm font-medium">Size *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["small", "medium", "large"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border-2 transition-all ${
                        size === s
                          ? "bg-[#5F7E9D] text-white border-[#5F7E9D] shadow-md"
                          : "bg-white text-[#2F3E4E] border-gray-200 hover:border-[#5F7E9D]"
                      }`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      <span className="text-2xl">
                        {s === "small" ? "🐩" : s === "medium" ? "🐕" : "🦴"}
                      </span>
                      <span className="text-sm font-medium capitalize">{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Personality ────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-7">
              {/* Energy slider */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[#2F3E4E] text-sm font-medium">Energy Level</Label>
                  <span
                    className="text-sm font-semibold text-[#5F7E9D] bg-[#5F7E9D]/10 px-3 py-1 rounded-full"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {ENERGY_LABELS[energyLevel]}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#5F7E9D]"
                    style={{ background: `linear-gradient(to right, #5F7E9D ${(energyLevel - 1) * 25}%, #e5e7eb ${(energyLevel - 1) * 25}%)` }}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2" style={{ fontFamily: "Inter, sans-serif" }}>
                    <span>😴 Very Low</span>
                    <span>⚡ Very High</span>
                  </div>
                </div>
                {/* Energy level pips */}
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setEnergyLevel(n)}
                      className={`py-2 rounded-lg text-xs font-medium transition-all border-2 ${
                        energyLevel === n
                          ? "bg-[#5F7E9D] text-white border-[#5F7E9D]"
                          : "bg-white text-gray-400 border-gray-200 hover:border-[#5F7E9D]"
                      }`}
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperament */}
              <div className="flex flex-col gap-3">
                <div>
                  <Label className="text-[#2F3E4E] text-sm font-medium">Temperament</Label>
                  <p className="text-gray-400 text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                    Select all that describe your dog
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TEMPERAMENT_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => toggle(temperament, t.value, setTemperament)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm border-2 transition-all ${
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
                  <p className="text-xs text-[#5F7E9D]" style={{ fontFamily: "Inter, sans-serif" }}>
                    {temperament.length} selected
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Care Needs ─────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              {/* Care type */}
              <div className="flex flex-col gap-3">
                <div>
                  <Label className="text-[#2F3E4E] text-sm font-medium">Type of Care Needed *</Label>
                  <p className="text-gray-400 text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                    Select all that apply
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {CARE_TYPE_OPTIONS.map((ct) => (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => toggle(careType, ct.value, setCareType)}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        careType.includes(ct.value)
                          ? "bg-[#5F7E9D]/5 border-[#5F7E9D] text-[#2F3E4E]"
                          : "bg-white border-gray-200 hover:border-[#5F7E9D]"
                      }`}
                    >
                      <span className="text-2xl mt-0.5">{ct.icon}</span>
                      <div>
                        <p className={`text-sm font-semibold ${careType.includes(ct.value) ? "text-[#5F7E9D]" : "text-[#2F3E4E]"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                          {ct.label}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                          {ct.desc}
                        </p>
                      </div>
                      {careType.includes(ct.value) && (
                        <span className="ml-auto text-[#5F7E9D] text-sm font-bold flex-shrink-0">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-3">
                <Label className="text-[#2F3E4E] text-sm font-medium">Location</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="h-12 rounded-xl border-gray-200 focus:border-[#5F7E9D] text-[#2F3E4E]"
                  />
                  <Input
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="ZIP / Area code"
                    className="h-12 rounded-xl border-gray-200 focus:border-[#5F7E9D] text-[#2F3E4E]"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="flex flex-col gap-3">
                <Label className="text-[#2F3E4E] text-sm font-medium">When do you need care?</Label>
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

          {/* ── Step 4: Special Needs ──────────────────────────── */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              {/* Toggle */}
              <button
                type="button"
                onClick={() => setSpecialNeeds(!specialNeeds)}
                className={`flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all w-full ${
                  specialNeeds
                    ? "border-[#5F7E9D] bg-[#5F7E9D]/5"
                    : "border-gray-200 bg-white hover:border-[#5F7E9D]/50"
                }`}
              >
                <div className={`w-12 h-6 rounded-full flex items-center px-1 flex-shrink-0 transition-colors ${
                  specialNeeds ? "bg-[#5F7E9D]" : "bg-gray-200"
                }`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    specialNeeds ? "translate-x-6" : "translate-x-0"
                  }`} />
                </div>
                <div>
                  <p className={`font-semibold text-[15px] ${specialNeeds ? "text-[#5F7E9D]" : "text-[#2F3E4E]"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                    My dog has special needs
                  </p>
                  <p className="text-gray-400 text-sm mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                    Medical requirements, medication, restrictions
                  </p>
                </div>
              </button>

              {specialNeeds && (
                <div className="flex flex-col gap-2">
                  <Label className="text-[#2F3E4E] text-sm font-medium">Describe the special needs</Label>
                  <textarea
                    autoFocus
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Takes anxiety medication twice a day, needs a quiet environment, cannot be around other dogs..."
                    rows={4}
                    className="w-full rounded-xl border-2 border-gray-200 focus:border-[#5F7E9D] focus:outline-none px-4 py-3 text-sm text-[#2F3E4E] resize-none"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                </div>
              )}

              {!specialNeeds && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="text-[#2F3E4E] font-semibold text-[17px] mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
                    Almost done!
                  </p>
                  <p className="text-gray-400 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                    Toggle the switch above if {name || "your dog"} has any special needs, otherwise you&apos;re good to go.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600" style={{ fontFamily: "Inter, sans-serif" }}>{error}</p>
            </div>
          )}
        </div>

        {/* Navigation footer */}
        <div className="px-8 pb-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => step === 1 ? router.back() : setStep((s) => s - 1)}
            className="h-12 px-6 text-[#2F3E4E] text-[15px] font-medium rounded-xl border-2 border-gray-200 hover:border-[#5F7E9D] transition-all"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 h-12 bg-[#5F7E9D] text-white font-semibold text-[15px] rounded-xl border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 h-12 bg-[#5F7E9D] text-white font-semibold text-[15px] rounded-xl border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {isLoading ? "Saving..." : "🐾 Save Dog Profile"}
            </button>
          )}
        </div>
      </div>

      {/* Step label on mobile */}
      <p className="text-center text-xs text-gray-400 mt-4 sm:hidden" style={{ fontFamily: "Inter, sans-serif" }}>
        {STEPS[step - 1].title} — {STEPS[step - 1].desc}
      </p>
    </div>
  );
}
