"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CATEGORY_OPTIONS = [
  { value: "grooming", label: "Grooming", icon: "✂️" },
  { value: "training", label: "Training", icon: "🎓" },
  { value: "vet", label: "Veterinary", icon: "🩺" },
  { value: "walking", label: "Dog Walking", icon: "🦮" },
  { value: "boarding", label: "Boarding", icon: "🏠" },
  { value: "other", label: "Other", icon: "🐾" },
];

interface ProviderProfileFormProps {
  userId: string;
  existingProfile?: {
    id: string;
    business_name: string;
    description: string | null;
    category: string;
    city: string;
    zip_code: string | null;
    phone: string | null;
    website: string | null;
    email: string | null;
  } | null;
}

export function ProviderProfileForm({ userId, existingProfile }: ProviderProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [businessName, setBusinessName] = useState(existingProfile?.business_name ?? "");
  const [description, setDescription] = useState(existingProfile?.description ?? "");
  const [category, setCategory] = useState<string>(existingProfile?.category ?? "grooming");
  const [city, setCity] = useState(existingProfile?.city ?? "");
  const [zipCode, setZipCode] = useState(existingProfile?.zip_code ?? "");
  const [phone, setPhone] = useState(existingProfile?.phone ?? "");
  const [website, setWebsite] = useState(existingProfile?.website ?? "");
  const [email, setEmail] = useState(existingProfile?.email ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !city.trim()) {
      setError("Business name and city are required");
      return;
    }

    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    const payload = {
      business_name: businessName.trim(),
      description: description.trim() || null,
      category,
      city: city.trim(),
      zip_code: zipCode.trim() || null,
      phone: phone.trim() || null,
      website: website.trim() || null,
      email: email.trim() || null,
      updated_at: new Date().toISOString(),
    };

    let dbError;
    if (existingProfile?.id) {
      const { error } = await supabase
        .from("providers")
        .update(payload)
        .eq("id", existingProfile.id);
      dbError = error;
    } else {
      const { error } = await supabase.from("providers").insert({
        ...payload,
        user_id: userId,
      });
      dbError = error;
    }

    setIsLoading(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }

    setSuccess(true);
    router.refresh();
    setTimeout(() => router.push("/dashboard/provider"), 1500);
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
            Profile {existingProfile ? "updated" : "created"}!
          </h2>
          <p className="text-gray-400 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-gray-50">
          <h2
            className="text-[#2F3E4E] text-[26px] font-semibold leading-tight"
            style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
          >
            Service provider profile
          </h2>
          <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
            Tell dog owners about your business and services
          </p>
        </div>

        <div className="px-8 py-7 space-y-5">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[#2F3E4E] text-sm font-medium">Business Name *</Label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Happy Paws Grooming"
              required
              className="h-11 rounded-xl border-gray-200 focus:border-[#5F7E9D]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[#2F3E4E] text-sm font-medium">Category *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCategory(opt.value)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    category === opt.value
                      ? "border-[#5F7E9D] bg-[#5F7E9D]/10 text-[#5F7E9D]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[#2F3E4E] text-sm font-medium">Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your business, experience, and what makes you special..."
              rows={4}
              className="w-full rounded-xl border-2 border-gray-200 focus:border-[#5F7E9D] focus:outline-none px-4 py-3 text-sm text-[#2F3E4E] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-[#2F3E4E] text-sm font-medium">City *</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Austin"
                required
                className="h-11 rounded-xl border-gray-200 focus:border-[#5F7E9D]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-[#2F3E4E] text-sm font-medium">ZIP Code</Label>
              <Input
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="e.g. 78701"
                className="h-11 rounded-xl border-gray-200 focus:border-[#5F7E9D]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[#2F3E4E] text-sm font-medium">Phone</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1-512-555-0100"
              className="h-11 rounded-xl border-gray-200 focus:border-[#5F7E9D]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[#2F3E4E] text-sm font-medium">Email (for inquiries)</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@yourbusiness.com"
              className="h-11 rounded-xl border-gray-200 focus:border-[#5F7E9D]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[#2F3E4E] text-sm font-medium">Website</Label>
            <Input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="h-11 rounded-xl border-gray-200 focus:border-[#5F7E9D]"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[#5F7E9D] text-white font-medium rounded-xl hover:bg-[#4e6d8c] transition-colors disabled:opacity-60"
          >
            {isLoading ? "Saving..." : existingProfile ? "Update Profile" : "Create Profile"}
          </button>
        </div>
      </div>
    </form>
  );
}
