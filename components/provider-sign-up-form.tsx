"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProviderSignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: "provider" },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback?next=/onboarding/provider`,
        },
      });
      if (error) throw error;
      router.push("/auth/provider-signup-success");
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
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <span>🏪</span>
            <span style={{ fontFamily: "Inter, sans-serif" }}>Service provider registration</span>
          </div>
          <h1
            className="text-[#2F3E4E] text-2xl font-semibold mb-1"
            style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
          >
            Become a myPawPair service provider
          </h1>
          <p className="text-gray-500 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            List your grooming, training, vet, or other dog services
          </p>
        </div>

        <div className="px-8 pb-8 pt-6">
          <form onSubmit={handleSignUp} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="provider-full-name" className="text-[#2F3E4E] text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="provider-full-name"
                type="text"
                placeholder="Your full name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-11 rounded-xl border-gray-200 focus:border-[#5F7E9D] focus:ring-[#5F7E9D] text-[#2F3E4E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="provider-email" className="text-[#2F3E4E] text-sm font-medium">
                Email
              </Label>
              <Input
                id="provider-email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl border-gray-200 focus:border-[#5F7E9D] focus:ring-[#5F7E9D] text-[#2F3E4E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="provider-password" className="text-[#2F3E4E] text-sm font-medium">
                Password
              </Label>
              <Input
                id="provider-password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-xl border-gray-200 focus:border-[#5F7E9D] focus:ring-[#5F7E9D] text-[#2F3E4E]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="provider-repeat-password" className="text-[#2F3E4E] text-sm font-medium">
                Confirm Password
              </Label>
              <Input
                id="provider-repeat-password"
                type="password"
                placeholder="••••••••"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="h-11 rounded-xl border-gray-200 focus:border-[#5F7E9D] focus:ring-[#5F7E9D] text-[#2F3E4E]"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="bg-[#F6F2EA] rounded-xl px-4 py-3 flex flex-col gap-1">
              <p className="text-[#2F3E4E] text-xs font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>
                What happens next?
              </p>
              <ul className="text-gray-500 text-xs space-y-1 mt-1" style={{ fontFamily: "Inter, sans-serif" }}>
                <li>✓ Confirm your email address</li>
                <li>✓ Complete your service provider profile (business name, category, location)</li>
                <li>✓ Add your services to your dashboard</li>
                <li>✓ Get discovered by dog owners in your area</li>
              </ul>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#5F7E9D] text-white font-medium text-[16px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {isLoading ? "Creating account..." : "Become a service provider"}
            </button>

            <p className="text-center text-sm text-gray-500" style={{ fontFamily: "Inter, sans-serif" }}>
              Looking for care instead?{" "}
              <Link href="/auth/sign-up" className="text-[#5F7E9D] font-medium hover:underline">
                Sign up as an Owner
              </Link>
            </p>

            <p className="text-center text-sm text-gray-500" style={{ fontFamily: "Inter, sans-serif" }}>
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#5F7E9D] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
