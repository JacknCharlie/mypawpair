"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ChevronDown, Settings, LogOut, User } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  userRole: "owner" | "caregiver" | "admin";
}

export function DashboardHeader({ userName, userRole }: DashboardHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const roleLabel =
    userRole === "admin" ? "Admin" : userRole === "caregiver" ? "Care provider" : "Dog Owner";
  const roleColor =
    userRole === "admin"
      ? "bg-green-100 text-green-700"
      : userRole === "caregiver"
        ? "bg-amber-100 text-amber-700"
        : "bg-blue-100 text-blue-700";
  const settingsHref =
    userRole === "admin"
      ? "/dashboard/admin/settings"
      : userRole === "caregiver"
        ? "/dashboard/caregiver/settings"
        : "/dashboard/owner/settings";

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-[#F6F2EA] sticky top-0 z-50 border-b border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="myPawPair Logo"
              width={200}
              height={50}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-[#5F7E9D] text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                {initials}
              </div>

              {/* Name + role — hidden on mobile */}
              <div className="hidden sm:flex flex-col items-start">
                <span
                  className="text-[#2F3E4E] text-sm font-medium leading-tight"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {userName || "My Account"}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-tight mt-0.5 ${roleColor}`}
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  {roleLabel}
                </span>
              </div>

              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown menu */}
            {isOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#5F7E9D] text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-[#2F3E4E] text-sm font-semibold truncate"
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {userName || "My Account"}
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleColor}`}
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {roleLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                  <Link
                    href={
                      userRole === "admin"
                        ? "/dashboard/admin"
                        : userRole === "caregiver"
                          ? "/dashboard/caregiver"
                          : "/dashboard/owner"
                    }
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2F3E4E] hover:bg-[#F6F2EA] transition-colors"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    My Dashboard
                  </Link>

                  <Link
                    href={settingsHref}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#2F3E4E] hover:bg-[#F6F2EA] transition-colors"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <Settings className="h-4 w-4 text-gray-400" />
                    Account Settings
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
                    {isLoggingOut ? "Signing out..." : "Sign Out"}
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
