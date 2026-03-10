"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      setSuccess(true);
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
          <Image src="/logo.png" alt="PawPair" width={160} height={40} className="h-12 w-auto" />
        </Link>
        <p className="text-[#2F3E4E] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
          Pet care, perfectly matched.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {success ? (
          <div className="px-8 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2
                className="text-[#2F3E4E] text-xl font-semibold mb-2"
                style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
              >
                Check your email
              </h2>
              <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                If you registered with this email, you'll receive a password reset link shortly.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="mt-2 text-[#5F7E9D] text-sm font-medium hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="px-8 pt-8 pb-2">
              <h1
                className="text-[#2F3E4E] text-2xl font-semibold mb-1"
                style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
              >
                Reset your password
              </h1>
              <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <div className="px-8 pb-8 pt-6">
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-[#2F3E4E] text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </button>

                <p className="text-center text-sm text-gray-500" style={{ fontFamily: "Inter, sans-serif" }}>
                  Remember your password?{" "}
                  <Link href="/auth/login" className="text-[#5F7E9D] font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
