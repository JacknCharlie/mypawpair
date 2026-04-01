import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const params = await searchParams;
  return (
    <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
      {params?.error ? `Error: ${params.error}` : "An unspecified error occurred. Please try again."}
    </p>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[#F6F2EA]">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 mb-2">
          <Link href="/">
            <Image src="/logo.png" alt="myPawPair" width={160} height={40} className="h-12 w-auto" />
          </Link>
          <p className="text-[#2F3E4E] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
            Pet care, perfectly matched.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-8 py-10 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <div>
            <h1
              className="text-[#2F3E4E] text-2xl font-semibold mb-2"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              Something went wrong
            </h1>
            <Suspense fallback={<p className="text-gray-400 text-sm">Loading...</p>}>
              <ErrorContent searchParams={searchParams} />
            </Suspense>
          </div>

          <Link
            href="/auth/login"
            className="btn-all-sign-in mt-2 w-full h-11 flex items-center justify-center bg-[#5F7E9D] text-white font-medium text-[16px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
