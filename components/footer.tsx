"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: "🎉 Success! Check your email for confirmation." 
        });
        setEmail("");
      } else {
        setMessage({ 
          type: "error", 
          text: data.error || "Something went wrong. Please try again." 
        });
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: "Network error. Please check your connection and try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer id="contact" className="w-full relative overflow-hidden">
      <div
        className="footer-bg absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/footerbg.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 sm:px-12 lg:px-16 py-24 md:py-32 pb-32 md:pb-40">
        <div className="flex flex-col items-center text-center md:max-w-[756px] md:mx-auto space-y-4">
          <h2 className="font-['Modern_Sans'] font-normal text-[27px] md:text-[36px] lg:text-[40px] xl:text-[46px] leading-[120%] text-[#fff]">
            Get Early Access to PawPair
          </h2>

          <p className="text-[16px] !mt-5 font-inter font-normal md:text-[18px] leading-[120%] text-[#fff]">
            Be among the first dog owners to experience PawPair — the AI assistant designed to understand your dog. Join the waitlist to get early access, updates, and exclusive features before the public launch.
          </p>

          {/* Email + Button Form */}
          <form onSubmit={handleSubmit} className="mt-8 w-full max-w-lg" aria-label="Join the PawPair waitlist">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-0">
              <label htmlFor="waitlist-email" className="sr-only">
                Email address for waitlist
              </label>
              <input
                id="waitlist-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                autoComplete="email"
                className="font-inter flex-1 px-5 py-3 bg-[#D9D9D9] border border-gray-300 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-[#5F7E9D] text-gray-900 placeholder-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                aria-invalid={message?.type === "error"}
                aria-describedby={message ? "waitlist-message" : undefined}
              />
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                aria-label={loading ? "Joining waitlist" : "Join the waitlist"}
                className="footer-inputs-btn font-modern font-normal px-8 py-3 bg-[#5F7E9D] text-[16px] rounded-[10px] -ml-[20px] md:text-[18px] lg:text-[20px] text-white font-regular rounded-lg sm:rounded-l-none sm:rounded-r-lg hover:bg-[#4b657d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[180px] sm:min-w-[160px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Joining...
                  </span>
                ) : (
                  "Join the Waitlist"
                )}
              </button>
            </div>
            
            {/* Success/Error Message */}
            {message && (
              <div
                id="waitlist-message"
                role="alert"
                className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}
          </form>
        </div>
      </div>

      <div className="relative z-10 px-8 sm:px-12 lg:px-16 pb-8 -mt-24 md:-mt-28">
        <div className="max-w-[1200px] mx-auto bg-[#F6F2EA] rounded-[20px] px-16 !pb-[30px] md:px-24 py-10 md:py-12 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-5">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="PawPair Logo"
                width={200}
                height={50}
                className="h-14 w-auto"
              />
            </Link>

            <div className="max-w-2xl">
              <p className=" font-inter text-[16px] text-[#4A5563] font-['Inter'] md:text-[18px] font-normal leading-[120%] tracking-[0%]">
              AI-powered care for your dog, starting in your neighborhood.
              </p>
            </div>

            <div className="pt-6 w-full border-t border-[#000000]/10">
              <p className=" font-inter text-[16px] text-[#000000] font-['Inter'] md:text-[18px] font-normal leading-[120%] tracking-[0%] opacity-80">
                © 2026 PawPair. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
