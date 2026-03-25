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

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-8 py-10 flex flex-col items-center text-center gap-5">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-[#5F7E9D]/10 flex items-center justify-center text-3xl">
            🐾
          </div>

          <div>
            <h1
              className="text-[#2F3E4E] text-2xl font-semibold mb-2"
              style={{ fontFamily: "var(--font-modern-sans), ui-sans-serif, system-ui, sans-serif" }}
            >
              Application Received!
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
              Thank you for applying to be a myPawPair caregiver. We&apos;ve sent a confirmation
              link to your email — please check your inbox and verify your account.
            </p>
          </div>

          {/* Steps */}
          <div className="w-full bg-[#F6F2EA] rounded-xl px-5 py-4 text-left">
            <p
              className="text-[#2F3E4E] text-xs font-semibold mb-3"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              What happens next
            </p>
            <div className="flex flex-col gap-3">
              {[
                { step: "1", text: "Verify your email address" },
                { step: "2", text: "Complete your caregiver profile" },
                { step: "3", text: "Our team reviews your application" },
                { step: "4", text: "Get matched with dogs near you" },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#5F7E9D] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </div>
                  <p className="text-[#2F3E4E] text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/auth/login"
            className="mt-1 w-full h-11 flex items-center justify-center bg-[#5F7E9D] text-white font-medium text-[16px] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Sign In to Your Account
          </Link>

          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-[#5F7E9D] transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
