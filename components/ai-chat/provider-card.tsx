"use client";

import { MapPin, Star, Phone, Mail } from "lucide-react";
import Link from "next/link";

interface Provider {
  id: string;
  business_name: string;
  category: string;
  city: string;
  phone?: string;
  email?: string;
  rating?: number;
}

interface ProviderCardProps {
  provider: Provider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  return (
    <Link
      href={`/providers/${provider.id}`}
      className="block p-4 rounded-xl bg-white border-2 border-[#F3B443]/20 hover:border-[#F3B443] hover:shadow-[0px_4px_8px_rgba(137,82,43,0.3)] transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[#260900] text-sm sm:text-base truncate">
            {provider.business_name}
          </h4>
          <div className="flex items-center gap-1 mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#F3B443]/10 text-[#F3B443] font-medium">
              {provider.category}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-[#4A5563]">
            <MapPin className="h-3 w-3" />
            <span className="truncate">{provider.city}</span>
          </div>
          {provider.rating && (
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-[#F3B443] text-[#F3B443]" />
              <span className="text-xs text-[#4A5563]">{provider.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {provider.phone && (
            <button className="p-1.5 rounded-lg bg-[#F3B443]/10 hover:bg-[#F3B443]/20 text-[#F3B443] transition-colors">
              <Phone className="h-3.5 w-3.5" />
            </button>
          )}
          {provider.email && (
            <button className="p-1.5 rounded-lg bg-[#F3B443]/10 hover:bg-[#F3B443]/20 text-[#F3B443] transition-colors">
              <Mail className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}

interface ProviderGridProps {
  providers: Provider[];
  title?: string;
}

export function ProviderGrid({ providers, title }: ProviderGridProps) {
  if (!providers || providers.length === 0) return null;

  return (
    <div className="mt-4 p-4 rounded-xl bg-[#FFF9ED] border border-[#F3B443]/20">
      {title && (
        <h3 className="text-sm font-medium text-[#260900] mb-3">
          {title}
        </h3>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
}
