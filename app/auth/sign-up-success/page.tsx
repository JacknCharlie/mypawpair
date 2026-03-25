import Image from "next/image";
import Link from "next/link";

export default function Page() {
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
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h1
              className="text-[#2F3E4E] text-2xl font-semibold mb-2"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              You're almost in!
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              We've sent a confirmation link to your email. Please check your inbox and click the link to activate your account.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="mt-2 w-full h-11 flex items-center justify-center bg-[#5F7E9D] text-white font-medium text-[16px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
