"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SIZE_OPTIONS = [
  { value: "small",  label: "Small",  emoji: "🐩" },
  { value: "medium", label: "Medium", emoji: "🐕" },
  { value: "large",  label: "Large",  emoji: "🦴" },
];
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
const SERVICE_OPTIONS = [
  { value: "boarding",  label: "Boarding",       icon: "🏠", desc: "Dog stays at your home" },
  { value: "daycare",   label: "Daycare",        icon: "☀️", desc: "Care during the day" },
  { value: "walking",   label: "Dog Walking",    icon: "🦮", desc: "Regular walks" },
  { value: "drop-in",   label: "Drop-in Visit",  icon: "🚪", desc: "Visit owner's home" },
  { value: "training",  label: "Training",       icon: "🎓", desc: "Obedience & behaviour" },
];
const AVAILABILITY_OPTIONS = [
  { value: "weekdays", label: "Weekdays" },
  { value: "weekends", label: "Weekends" },
  { value: "anytime",  label: "Anytime" },
  { value: "mornings", label: "Mornings only" },
  { value: "evenings", label: "Evenings only" },
];

const STEPS = [
  { num: 1, title: "About You",       icon: "👋", desc: "Bio, experience & certifications" },
  { num: 2, title: "Your Services",   icon: "🛎️", desc: "What care you provide" },
  { num: 3, title: "Dog Preferences", icon: "🐾", desc: "Sizes & temperaments you accept" },
  { num: 4, title: "Location",        icon: "📍", desc: "Where you work & when you're free" },
];

interface CaregiverProfileFormProps {
  userId: string;
  existingProfile?: {
    id: string;
    bio: string | null;
    experience_years: number | null;
    accepts_sizes: string[] | null;
    accepts_temperaments: string[] | null;
    services: string[] | null;
    certifications: string | null;
    city: string | null;
    zip_code: string | null;
    availability: string | null;
  } | null;
}

export function CaregiverProfileForm({ userId, existingProfile }: CaregiverProfileFormProps) {
  const router = useRouter();
  const isEditing = !!existingProfile;

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Step 1
  const [bio, setBio] = useState(existingProfile?.bio ?? "");
  const [experienceYears, setExperienceYears] = useState(
    existingProfile?.experience_years?.toString() ?? ""
  );
  const [certifications, setCertifications] = useState(existingProfile?.certifications ?? "");

  // Step 2
  const [services, setServices] = useState<string[]>(existingProfile?.services ?? []);

  // Step 3
  const [acceptsSizes, setAcceptsSizes] = useState<string[]>(existingProfile?.accepts_sizes ?? []);
  const [acceptsTemperaments, setAcceptsTemperaments] = useState<string[]>(
    existingProfile?.accepts_temperaments ?? []
  );

  // Step 4
  const [city, setCity] = useState(existingProfile?.city ?? "");
  const [zipCode, setZipCode] = useState(existingProfile?.zip_code ?? "");
  const [availability, setAvailability] = useState(existingProfile?.availability ?? "");

  const toggle = (arr: string[], item: string, set: (v: string[]) => void) =>
    set(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);

  const canNext = () => {
    if (step === 2) return services.length > 0;
    if (step === 3) return acceptsSizes.length > 0;
    return true;
  };

  const handleNext = () => {
    setError(null);
    if (!canNext()) {
      if (step === 2) setError("Please select at least one service you offer");
      if (step === 3) setError("Please select at least one dog size you accept");
      return;
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      user_id: userId,
      bio: bio || null,
      experience_years: experienceYears ? parseInt(experienceYears) : null,
      accepts_sizes: acceptsSizes,
      accepts_temperaments: acceptsTemperaments.length > 0 ? acceptsTemperaments : null,
      services,
      certifications: certifications || null,
      city: city || null,
      zip_code: zipCode || null,
      availability: availability || null,
    };

    let dbError;
    if (isEditing && existingProfile?.id) {
      const { error } = await supabase.from("caregivers").update(payload).eq("id", existingProfile.id);
      dbError = error;
    } else {
      const { error } = await supabase.from("caregivers").insert(payload);
      dbError = error;
    }

    setIsLoading(false);
    if (dbError) { setError(dbError.message); return; }

    setSuccess(true);
    router.refresh();
    setTimeout(() => router.push("/dashboard/caregiver"), 1500);
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 flex flex-col items-center text-center gap-4">
          <div className="text-6xl">🎉</div>
          <h2
            className="text-[#2F3E4E] text-2xl font-semibold"
            style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
          >
            Profile {isEditing ? "updated" : "submitted"}!
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            {isEditing
              ? "Your changes have been saved."
              : "Our team will review your application shortly."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto w-full">

      {/* Step indicator */}
      <div className="flex items-start justify-between mb-8 relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-[#5F7E9D] z-0 transition-all duration-500"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2 z-10 flex-1">
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
          <p className="text-[#6B7280] text-xs font-semibold uppercase tracking-widest mb-1 font-inter">
            Step {step} of {STEPS.length}
          </p>
          <h2
            className="text-[#260900] text-[26px] font-semibold leading-tight font-modern"
          
          >
            {STEPS[step - 1].icon} {STEPS[step - 1].title}
          </h2>
          <p className="text-[#260900] text-sm mt-1 font-modern">
            {STEPS[step - 1].desc}
          </p>
        </div>

        {/* Step content */}
        <div className="px-8 py-7">

          {/* ── Step 1: About You ──────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[#260900] text-sm font-medium font-modern">Bio</Label>
                <p className="text-[#6B7280] text-xs -mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                  Tell dog owners about yourself — your experience, love for dogs, home environment
                </p>
                <textarea
                  autoFocus
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. I'm a dog lover with 5 years of experience caring for dogs of all sizes. I have a spacious home with a yard..."
                  rows={5}
                  className="w-full rounded-xl border-2 border-gray-200 focus:border-[#F3B443] focus:outline-none px-4 py-3 text-sm text-[#2F3E4E] resize-none mt-1"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
                <p className="text-right text-xs text-gray-300" style={{ fontFamily: "Inter, sans-serif" }}>
                  {bio.length}/500
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[#260900] text-sm font-medium font-modern">Years of Experience</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="e.g. 5"
                    className="h-12 rounded-xl border-gray-200 focus:border-[#F3B443] text-[#2F3E4E]  focus-visible:ring-0"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[#260900] text-sm font-medium font-modern">Certifications <span className="text-[#6B7280] font-normal">(optional)</span></Label>
                  <Input
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                    placeholder="e.g. Pet First Aid"
                    className="h-12 rounded-xl border-gray-200 focus:border-[#F3B443] text-[#2F3E4E] focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Services ───────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <p className="text-[#6B7280] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                Select all services you&apos;re comfortable providing
              </p>
              <div className="flex flex-col gap-3">
                {SERVICE_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggle(services, s.value, setServices)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl border-2 text-left transition-all ${
                      services.includes(s.value)
                        ? "bg-[#5F7E9D]/5 border-[#5F7E9D]"
                        : "bg-white border-gray-200 hover:border-[#5F7E9D]/50"
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{s.icon}</span>
                    <div className="flex-1">
                      <p
                        className={`font-semibold text-[15px] ${services.includes(s.value) ? "text-[#5F7E9D]" : "text-[#2F3E4E]"}`}
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {s.label}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                        {s.desc}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        services.includes(s.value)
                          ? "bg-[#5F7E9D] border-[#5F7E9D] text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {services.includes(s.value) && <span className="text-xs">✓</span>}
                    </div>
                  </button>
                ))}
              </div>
              {services.length > 0 && (
                <p className="text-xs text-[#5F7E9D] font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                  {services.length} service{services.length !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}

          {/* ── Step 3: Dog Preferences ────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col gap-7">
              {/* Sizes */}
              <div className="flex flex-col gap-3">
                <div>
                  <Label className="text-[#2F3E4E] text-sm font-medium">Dog Sizes You Accept *</Label>
                  <p className="text-gray-400 text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                    Select all sizes you&apos;re comfortable with
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => toggle(acceptsSizes, s.value, setAcceptsSizes)}
                      className={`flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 transition-all ${
                        acceptsSizes.includes(s.value)
                          ? "bg-[#5F7E9D] text-white border-[#5F7E9D] shadow-md"
                          : "bg-white text-[#2F3E4E] border-gray-200 hover:border-[#5F7E9D]"
                      }`}
                    >
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="text-sm font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperaments */}
              <div className="flex flex-col gap-3">
                <div>
                  <Label className="text-[#2F3E4E] text-sm font-medium">Temperaments You&apos;re Comfortable With</Label>
                  <p className="text-gray-400 text-xs mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                    Leave blank to accept all
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TEMPERAMENT_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => toggle(acceptsTemperaments, t.value, setAcceptsTemperaments)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm border-2 transition-all ${
                        acceptsTemperaments.includes(t.value)
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
                {acceptsTemperaments.length > 0 && (
                  <p className="text-xs text-[#5F7E9D]" style={{ fontFamily: "Inter, sans-serif" }}>
                    {acceptsTemperaments.length} selected
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 4: Location & Availability ───────────────── */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[#2F3E4E] text-sm font-medium">City</Label>
                  <Input
                    autoFocus
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="h-12 rounded-xl border-gray-200 focus:border-[#5F7E9D] text-[#2F3E4E]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[#2F3E4E] text-sm font-medium">ZIP / Area Code</Label>
                  <Input
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="e.g. 400001"
                    className="h-12 rounded-xl border-gray-200 focus:border-[#5F7E9D] text-[#2F3E4E]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Label className="text-[#2F3E4E] text-sm font-medium">Your Availability</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABILITY_OPTIONS.map((a) => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => setAvailability(availability === a.value ? "" : a.value)}
                      className={`px-5 py-2.5 rounded-full text-sm border-2 transition-all font-medium ${
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

              {/* Summary preview */}
              <div className="bg-[#F6F2EA] rounded-xl p-5">
                <p className="text-[#2F3E4E] text-sm font-semibold mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
                  Profile Summary
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Services", value: services.join(", ") || "—" },
                    { label: "Accepts sizes", value: acceptsSizes.join(", ") || "—" },
                    { label: "Experience", value: experienceYears ? `${experienceYears} year${Number(experienceYears) !== 1 ? "s" : ""}` : "—" },
                    { label: "City", value: city || "—" },
                    { label: "Availability", value: availability || "—" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between gap-4">
                      <span className="text-gray-400 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>{row.label}</span>
                      <span className="text-[#2F3E4E] text-xs font-medium text-right capitalize" style={{ fontFamily: "Inter, sans-serif" }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
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
            className="h-12 px-6 text-[#F3B443] text-[15px] font-medium rounded-xl border-2 border-[#F3B443]  hover:border-[#F3B443] transition-all"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 h-12 bg-[#F3B443] text-white font-semibold text-[15px] rounded-xl border-2 border-transparent hover:bg-white hover:text-[#F3B443] hover:border-[#F3B443] transition-all duration-300"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 h-12 bg-[#F3B443] text-white font-semibold text-[15px] rounded-xl border-2 border-transparent hover:bg-white hover:text-[#F3B443] hover:border-[#F3B443] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {isLoading ? "Saving..." : isEditing ? "✓ Update Profile" : "🐾 Submit Application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
