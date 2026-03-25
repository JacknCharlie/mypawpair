"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function EmailVerifiedSuccessContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const isOwner = role === "owner";
  const isCaregiver = role === "caregiver";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6F2EA] to-[#E8DFD0] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-2 mb-6">
          <Link href="/">
            <Image src="/logo.png" alt="myPawPair" width={160} height={40} className="h-12 w-auto" />
          </Link>
          <p className="text-[#2F3E4E] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            Pet care, perfectly matched.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-8 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h1
                className="text-[#2F3E4E] text-2xl font-semibold mb-2"
                style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
              >
                {isCaregiver ? "Email Verified! 🎉" : "Welcome to myPawPair! 🎉"}
              </h1>
              
              {isOwner && (
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                    Your email has been successfully verified. You&apos;re all set to start finding trusted care providers for your furry friend!
                  </p>
                </div>
              )}

              {isCaregiver && (
                <div className="space-y-2">
                  <p className="text-gray-600 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                    Your email has been successfully verified!
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-4">
                    <p className="text-amber-800 text-xs font-semibold mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
                      ⏳ Application Under Review
                    </p>
                    <p className="text-amber-700 text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
                      Our team is reviewing your care provider application. You&apos;ll receive an email once you&apos;ve been approved to start accepting care requests.
                    </p>
                  </div>
                </div>
              )}

              {!isOwner && !isCaregiver && (
                <p className="text-gray-600 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                  Your email has been successfully verified. You can now sign in to your account.
                </p>
              )}
            </div>

            {isOwner && (
              <Link
                href="/dashboard"
                className="mt-4 w-full h-11 bg-[#5F7E9D] text-white font-medium text-[16px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300 flex items-center justify-center"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Go to Dashboard
              </Link>
            )}

            {isCaregiver && (
              <Link
                href="/auth/login"
                className="mt-4 w-full h-11 bg-[#5F7E9D] text-white font-medium text-[16px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300 flex items-center justify-center"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                Sign In
              </Link>
            )}

            {!isOwner && !isCaregiver && (
              <Link
                href="/auth/login"
                className="mt-4 text-[#5F7E9D] text-sm font-medium hover:underline"
              >
                Sign In to Your Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
