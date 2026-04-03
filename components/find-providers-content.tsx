"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, Globe, MapPin, Sparkles } from "lucide-react";

interface Provider {
  id: string;
  business_name: string;
  description: string | null;
  category: string;
  city: string;
  zip_code: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
}

interface Category {
  value: string;
  label: string;
}

interface Props {
  providers: Provider[];
  categories: Category[];
  initialCategory: string;
  initialCity: string;
  categoryLabels: Record<string, string>;
}

const FONT = { fontFamily: "Inter, sans-serif" } as const;

export function FindProvidersContent({
  providers,
  categories,
  initialCategory,
  initialCity,
  categoryLabels,
}: Props) {
  const router = useRouter();
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState(initialCity);

  const handleFilter = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (city.trim()) params.set("city", city.trim());
    router.push(`/find-providers?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      {/* ASK AI CTA */}
      <div className=" bg-white border-2 border-[#F3B443] rounded-2xl border border-[#5F7E9D]/20 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3B443] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="!font-['Modern_Sans'] font-semibold text-[#260900]" style={FONT}>
                Not sure what you need?
              </h3>
              <p className="text-sm text-[#4A5563] font-medium" style={FONT}>
                Ask our AI assistant for personalized recommendations
              </p>
            </div>
          </div>
          <Link
            href="/ask-ai"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F3B443] text-white font-medium rounded-xl hover:bg-[#4e6d8c] transition-colors shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            ASK AI
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-2" style={FONT}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#5F7E9D]/20 outline-none"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-2" style={FONT}>
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Austin"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#5F7E9D] focus:ring-1 focus:ring-[#5F7E9D]/20 outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#5F7E9D] text-white font-medium rounded-xl hover:bg-[#4e6d8c] transition-colors"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {providers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500" style={FONT}>
              No service providers match your filters. Try adjusting the category or city.
            </p>
          </div>
        ) : (
          providers.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-lg font-semibold text-[#2F3E4E]" style={FONT}>
                      {p.business_name}
                    </h2>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                      {categoryLabels[p.category] ?? p.category}
                    </span>
                  </div>
                  {(p.city || p.zip_code) && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {[p.city, p.zip_code].filter(Boolean).join(", ")}
                    </div>
                  )}
                  {p.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2" style={FONT}>
                      {p.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {p.phone && (
                      <a
                        href={`tel:${p.phone}`}
                        className="flex items-center gap-2 text-[#5F7E9D] hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {p.phone}
                      </a>
                    )}
                    {p.email && (
                      <a
                        href={`mailto:${p.email}`}
                        className="flex items-center gap-2 text-[#5F7E9D] hover:underline"
                      >
                        <Mail className="h-4 w-4" />
                        {p.email}
                      </a>
                    )}
                    {p.website && (
                      <a
                        href={p.website.startsWith("http") ? p.website : `https://${p.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#5F7E9D] hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {p.phone && (
                    <a
                      href={`tel:${p.phone}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5F7E9D] text-white text-sm font-medium rounded-xl hover:bg-[#4e6d8c] transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </a>
                  )}
                  {p.email && !p.phone && (
                    <a
                      href={`mailto:${p.email}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5F7E9D] text-white text-sm font-medium rounded-xl hover:bg-[#4e6d8c] transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
