"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Tab = "profile" | "security" | "danger";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "profile",  label: "Profile",   icon: "👤" },
  { id: "security", label: "Security",  icon: "🔒" },
  { id: "danger",   label: "Danger Zone", icon: "⚠️" },
];

interface AccountSettingsFormProps {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
}

export function AccountSettingsForm({
  userId,
  fullName: initialName,
  email,
  phone: initialPhone,
  city: initialCity,
}: AccountSettingsFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile tab state
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [city, setCity] = useState(initialCity);

  // Security tab state
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone: phone || null, city: city || null })
      .eq("id", userId);
    setIsProfileLoading(false);
    if (error) { setProfileError(error.message); return; }
    setProfileSuccess(true);
    router.refresh();
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setPasswordError("New passwords do not match"); return; }
    if (newPassword.length < 6) { setPasswordError("Password must be at least 6 characters"); return; }
    setIsPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPassword });
    if (signInError) { setPasswordError("Current password is incorrect"); setIsPasswordLoading(false); return; }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsPasswordLoading(false);
    if (error) { setPasswordError(error.message); return; }
    setPasswordSuccess(true);
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto w-full">

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? tab.id === "danger"
                  ? "bg-red-50 text-red-600 shadow-sm"
                  : "bg-[#5F7E9D] text-white shadow-sm"
                : tab.id === "danger"
                ? "text-red-400 hover:text-red-500"
                : "text-gray-500 hover:text-[#2F3E4E]"
            }`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <span className="hidden sm:inline">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* ── Profile tab ─────────────────────────────────── */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileUpdate}>
            <div className="px-8 pt-8 pb-6 border-b border-gray-50">
              <h2
                className="text-[#260900] text-[22px] font-semibold font-modern"

              >
                👤 Profile Information
              </h2>
              <p className="text-[#6B7280] text-sm mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                Update your name, phone, and location
              </p>
            </div>

            <div className="px-8 py-7 flex flex-col gap-5">
              {/* Email — read only */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-[#260900]  font-modern text-sm font-medium">Email</Label>
                <div className="relative">
                  <Input
                    value={email}
                    disabled
                    className="h-12 rounded-xl border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed pr-28"
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    Read only
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[#260900]  font-modern text-sm font-medium">Full Name</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="h-12 rounded-xl border-gray-200 focus:border-[#5F7E9D] text-[#2F3E4E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[#260900]  font-modern text-sm font-medium">Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-12 rounded-xl border-gray-200 focus:border-[#5F7E9D] text-[#2F3E4E]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-[#260900]  font-modern text-sm font-medium">City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="h-12 rounded-xl border-gray-200 focus:border-[#5F7E9D] text-[#2F3E4E]"
                  />
                </div>
              </div>

              {profileError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600" style={{ fontFamily: "Inter, sans-serif" }}>{profileError}</p>
                </div>
              )}
              {profileSuccess && (
                <div className="bg-[#F3B443]-50 border border-[#F3B443]-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="text-orange-500">✓</span>
                  <p className="text-sm text-[F3B443] font-medium" style={{ fontFamily: "Inter, sans-serif" }}>Profile updated successfully</p>
                </div>
              )}
            </div>

            <div className="px-8 pb-8">
              <button
                type="submit"
                disabled={isProfileLoading}
                className="w-full h-12 bg-[#F3B443] text-white font-semibold text-[15px] rounded-xl border-2 border-transparent hover:bg-white hover:text-[#F3B443] hover:border-[#F3B443] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {isProfileLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {/* ── Security tab ─────────────────────────────────── */}
        {activeTab === "security" && (
          <form onSubmit={handlePasswordUpdate}>
            <div className="px-8 pt-8 pb-6 border-b border-gray-50">
              <h2
                className="text-[#260900] text-[22px] font-semibold font-modern"
              >
                🔒 Change Password
              </h2>
              <p className="text-[#6B7280] text-sm mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                Use a strong password with at least 6 characters
              </p>
            </div>

            <div className="px-8 py-7 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[#260900] font-modern text-sm font-medium text-sm ">Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-[#5F7E9D] text-[#2F3E4E]"
                />
              </div>

              <div className="h-px bg-gray-100" />

              <div className="flex flex-col gap-1.5">
                <Label className="text-[#260900] font-modern text-sm font-medium">New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-[#5F7E9D] text-[#2F3E4E]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-[#260900] font-modern text-sm font-medium">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 rounded-xl border-gray-200 focus:border-[#5F7E9D] text-[#2F3E4E]"
                />
                {newPassword && confirmPassword && (
                  <p className={`text-xs mt-0.5 ${newPassword === confirmPassword ? "text-green-500" : "text-red-500"}`} style={{ fontFamily: "Inter, sans-serif" }}>
                    {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </p>
                )}
              </div>

              {passwordError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600" style={{ fontFamily: "Inter, sans-serif" }}>{passwordError}</p>
                </div>
              )}
              {passwordSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <p className="text-sm text-green-700 font-medium" style={{ fontFamily: "Inter, sans-serif" }}>Password changed successfully</p>
                </div>
              )}
            </div>

            <div className="px-8 pb-8">
              <button
                type="submit"
                disabled={isPasswordLoading}
                className="w-full h-12 bg-[#5F7E9D] text-white font-semibold text-[15px] rounded-xl border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {isPasswordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        )}

        {/* ── Danger Zone tab ──────────────────────────────── */}
        {activeTab === "danger" && (
          <div>
            <div className="px-8 pt-8 pb-6 border-b border-red-50">
              <h2
                className="text-red-600 text-[22px] font-semibold"
                style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
              >
                ⚠️ Danger Zone
              </h2>
              <p className="text-gray-400 text-sm mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                Permanent actions that cannot be undone
              </p>
            </div>

            <div className="px-8 py-7">
              <div className="rounded-xl border-2 border-red-100 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[#2F3E4E] font-semibold text-[15px]" style={{ fontFamily: "Inter, sans-serif" }}>
                    Delete Account
                  </p>
                  <p className="text-gray-400 text-sm mt-0.5" style={{ fontFamily: "Inter, sans-serif" }}>
                    Permanently delete your account and all associated data. This action cannot be reversed.
                  </p>
                </div>
                <button
                  type="button"
                  className="flex-shrink-0 h-10 px-5 text-red-500 text-sm font-medium rounded-xl border-2 border-red-200 hover:bg-red-50 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif" }}
                  onClick={() => alert("Please contact support to delete your account.")}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
