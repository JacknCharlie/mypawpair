"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFindCareHref } from "@/hooks/use-find-care-href";

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const findCareHref = useFindCareHref();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="home-banner absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/Background.png')", height:641, 
          backgroundColor: "#F6F2EA",
        }}
      />

      <div className="relative z-10 w-full flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-8 py-8 w-full">
          <div className="flex flex-col md:flex-row gap-[50px] items-center">
            <div
              className={`w-full order-2 md:order-1 lg:order-1 flex justify-center  md:max-w-[476px] lg:justify-start  transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "200ms" }}
            >
              <div className="relative w-full max-w-full">
                <Image
                  src="/left-dog.png"
                  alt="Happy dog"
                  width={500}
                  height={600}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>

            <div
              className={` w-full order-1 md:order-2 lg:order-2 space-y-6 md:max-w-[793px] transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              <h1 
                className="font-['Modern_Sans'] font-normal text-[27px] md:text-[36px] lg:text-[45px] xl:text-[60px] leading-[120%] text-[#2F3E4E]"
              >
                Meet the AI that knows your dog.
              </h1>

              <p 
                className="font-inter font-normal text-[18px] leading-[120%] text-[#4A5563]"
                
              >
                AI-powered care that understands your dog, not just your zip code.
              </p>

              <div className="flex flex-col sm:flex-row gap-[10px] sm:gap-[5px] mt-8">
                <Link
                  href={findCareHref}
                  className="font-modern inline-block px-8 py-3.5 bg-[#5F7E9D] text-white font-normal text-[18px] leading-[100%] rounded-[10px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-300 text-center"
                >
                  Create Your Dog's Profile
                </Link>
                <button
                  onClick={scrollToBottom}
                  className=" font-modern  inline-block px-8 py-3.5 text-[#5F7E9D] font-normal text-[18px] leading-[100%] rounded-[10px] border-2 border-[#5F7E9D] hover:bg-[#5F7E9D] hover:text-white transition-all duration-300 text-center"
              
                >
                  Ask PawPair AI
                </button>
              </div>
            </div>
          </div>
        </div>
      </div> 

      <button
        onClick={scrollToBottom}
        className={`absolute bottom-8 right-8 z-20 transition-all duration-1000 hover:scale-110 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
        style={{ transitionDelay: "800ms" }}
        aria-label="Scroll to bottom"
      >
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 animate-bounce">
          <Image
            src="/scrolltobottom.png"
            alt="Scroll to bottom"
            fill
            className="object-contain"
          />
        </div>
      </button>
    </section>
  );
}
