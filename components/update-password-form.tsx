"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      router.push("/dashboard");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 mb-2">
        <Link href="/">
          <Image src="/logo.png" alt="myPawPair" width={160} height={40} className="h-12 w-auto" />
        </Link>
        <p className="text-[#2F3E4E] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
          Meet the AI that knows your pet.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-8 pt-8 pb-2">
          <h1
            className="text-[#2F3E4E] text-2xl font-semibold mb-1"
            style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
          >
            Set new password
          </h1>
          <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            Choose a strong password for your account
          </p>
        </div>

        <div className="px-8 pb-8 pt-6">
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-[#2F3E4E] text-sm font-medium">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl border-gray-200 focus:border-[#5F7E9D] focus:ring-[#5F7E9D] text-[#2F3E4E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password" className="text-[#2F3E4E] text-sm font-medium">
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-xl border-gray-200 focus:border-[#5F7E9D] focus:ring-[#5F7E9D] text-[#2F3E4E]"
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
              className="w-full h-11 bg-[#5F7E9D] text-white font-medium text-[16px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {isLoading ? "Saving..." : "Save New Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
