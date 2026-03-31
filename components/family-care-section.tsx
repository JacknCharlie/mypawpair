"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function FamilyCareSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const points = [
    "Experienced providers",
    "Qualified trainers",
    "Dedicated pet sitters",
    "Passionate dog lovers",
    "Local service providers",
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full py-[60px] md:py-[70px] lg:py-[80px] bg-[#FFF2DD]"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[40px] items-center">
          {/* Text Content */}
          <div
            className={`space-y-6 transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <h2 className="font-['Modern_Sans'] font-normal text-[27px] md:text-[36px] lg:text-[40px] xl:text-[44px] leading-[120%] text-[#260900]">
         Trusted Local Care Providers
            </h2>

            <p
              className="text-[16px] !mt-5 font-sans font-normal md:text-[18px] leading-[120%] text-[#4A5563]"
              style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
             myPawPair connects you with verified trainers, groomers, vets, and walkers in your area. The AI can recommend the right provider based on your pet specific needs.
            </p>
   <div className="!mt-6">
              <h3
                className=" text-[18px] !text-[#260900]  font-modern font-normal leading-[120%] mb-5  md:text-[20px] xl:text-[24px]"
              >
                Many are:
              </h3>
      {/* List Points */}
<div className="!mt-6 space-y-3">
  {points.map((item, index) => (
    <div
      key={index}
      className={`flex items-center gap-3 transition-all duration-700`}
      style={{
        transitionDelay: `${(index + 1) * 100}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateX(0)" : "translateX(-20px)",
      }}
    >
      {/* Tick inside circle */}
      <div className="w-5 h-5 rounded-full border-2 border-[#F3B443] flex items-center justify-center flex-shrink-0 bg-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-3 h-3 text-[#F3B443]"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.586l7.879-7.879a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <p className="text-[18px] font-['Modern_Sans'] font-normal md:text-[18px] leading-[120%] text-[#6B7280]">
        {item}
      </p>
    </div>
  ))}
</div>
</div>
            <p
              className="text-[16px] !mt-5 font-sans font-normal md:text-[18px] leading-[120%] text-[#4A5563]"
              style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
              We prioritize heart, patience, and experience.
            </p>
          </div>

          {/* Image Content */}
          <div
            className={`transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative w-full md:max-w-full lg:max-w-[600px] mx-auto lg:ml-auto">
              <Image
                               src="/trustedimg.png"
                               alt="Man with dog in kitchen"
                               width={600}
                               height={450}
                               className="w-full h-auto rounded-[20px]"
                             />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}