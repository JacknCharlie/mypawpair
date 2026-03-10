"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PawPrint,
  ArrowLeftRight,
  Users,
  Menu,
  X,
  UserCheck,
  Heart,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const mainTabs = [
  { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
  { label: "Dogs", href: "/dashboard/admin/dogs", icon: PawPrint },
  { label: "Matches", href: "/dashboard/admin/matches", icon: ArrowLeftRight },
  { label: "Users", href: "/dashboard/admin/users", icon: Users },
];

const moreTabs = [
  { label: "Dog Owners", href: "/dashboard/admin/owners", icon: UserCheck },
  { label: "Caregivers", href: "/dashboard/admin/caregivers", icon: Heart },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const isMoreActive = moreTabs.some(
    (tab) => pathname === tab.href || pathname.startsWith(tab.href + "/")
  );

  useEffect(() => {
    setShowMore(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    }
    if (showMore) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMore]);

  return (
    <div className="md:hidden" ref={moreRef}>
      {showMore && (
        <div className="fixed bottom-[4.5rem] left-3 right-3 z-50 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          {moreTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setShowMore(false)}
                className={`flex items-center gap-3 px-5 py-3.5 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "text-[#5F7E9D] bg-[#5F7E9D]/5"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                <Icon
                  className={`h-[18px] w-[18px] ${
                    isActive ? "text-[#5F7E9D]" : "text-gray-400"
                  }`}
                />
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-gray-200">
        <div className="flex items-stretch justify-around h-[4.5rem] max-w-lg mx-auto">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === "/dashboard/admin"
                ? pathname === "/dashboard/admin"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
                  isActive ? "text-[#5F7E9D]" : "text-gray-400"
                }`}
              >
                <Icon
                  className="h-5 w-5"
                  strokeWidth={isActive ? 2.5 : 2}
                />
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

          <button
            onClick={() => setShowMore(!showMore)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
              isMoreActive || showMore ? "text-[#5F7E9D]" : "text-gray-400"
            }`}
          >
            {showMore ? (
              <X className="h-5 w-5" strokeWidth={2.5} />
            ) : (
              <Menu
                className="h-5 w-5"
                strokeWidth={isMoreActive ? 2.5 : 2}
              />
            )}
            <span
              className={`text-[10px] leading-none ${
                isMoreActive || showMore ? "font-semibold" : "font-medium"
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
