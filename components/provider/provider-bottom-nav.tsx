"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, User, Settings } from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard/provider", icon: LayoutDashboard },
  { label: "Services", href: "/dashboard/provider/services", icon: Briefcase },
  { label: "Profile", href: "/dashboard/provider/profile", icon: User },
  { label: "Settings", href: "/dashboard/provider/settings", icon: Settings },
];

export function ProviderBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200">
      <div className="flex items-stretch justify-around h-[4.5rem] max-w-lg mx-auto">
        {navItems.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === "/dashboard/provider"
              ? pathname === "/dashboard/provider"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
                isActive ? "text-[#5F7E9D]" : "text-gray-400"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span
                className={`text-[10px] leading-none ${
                  isActive ? "font-semibold" : "font-medium"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
