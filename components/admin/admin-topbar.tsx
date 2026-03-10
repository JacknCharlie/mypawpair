"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Settings, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const headingMap: Record<string, string> = {
  "/dashboard/admin": "Overview",
  "/dashboard/admin/dogs": "Dogs",
  "/dashboard/admin/owners": "Dog Owners",
  "/dashboard/admin/caregivers": "Caregivers",
  "/dashboard/admin/matches": "Matches",
  "/dashboard/admin/settings": "Settings",
  "/dashboard/admin/users": "Users",
  "/dashboard/admin/waitlist": "Waitlist",
};

interface AdminTopbarProps {
  userName: string;
}

export function AdminTopbar({ userName }: AdminTopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const heading = headingMap[pathname] ?? "Dashboard";
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shrink-0">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <h1
          className="text-lg font-semibold text-[#2F3E4E] truncate"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {heading}
        </h1>

        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#5F7E9D] text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {initials}
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-gray-400 hidden sm:block transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p
                    className="text-sm font-semibold text-[#2F3E4E] truncate"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    {userName}
                  </p>
                  <span
                    className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Admin
                  </span>
                </div>

                <div className="py-1.5">
                  <Link
                    href="/dashboard/admin/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2F3E4E] hover:bg-[#F6F2EA] transition-colors"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <Settings className="h-4 w-4 text-gray-400" />
                    Profile Settings
                  </Link>
                </div>

                <div className="border-t border-gray-100 py-1.5">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? "Signing out\u2026" : "Sign Out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
