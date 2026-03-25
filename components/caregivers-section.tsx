"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function CaregiversSection() {
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

  const caregiverTypes = [
    "Former vet techs",
    "Trainers",
    "Long-time pet sitters",
    "Retired pet lovers",
    "Passion-driven small business owners",
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full py-[60px] bg-[#5F7E9D]"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
        <div className="care-gives flex flex-col items-center gap-[40px] md:flex-col lg:flex-row">
          <div
            className={`w-full flex md:max-w-full lg:justify-start lg:max-w-[400px] xl:max-w-[546px] transition-all duration-1000 opacity-100  transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="relative w-full md:max-w-full lg:max-w-[546px] mx-auto lg:mx-0">
              <Image
                src="/petcuddle.png"
                alt="Care providers with dog"
                width={546}
                height={566}
                className="w-full h-auto rounded-[20px]"
              />
            </div>
          </div>

          <div
            className={`w-full md:max-w-full lg:max-w-[744px] transition-all duration-1000 opacity-100 translate-x-0 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            <h2
              className="font-['Modern_Sans'] font-normal text-[27px] md:text-[36px] lg:text-[40px] xl:text-[44px] leading-[120%] text-[#fff]"
              
            >
              Care providers who care deeply
            </h2>

            <p
              className="text-[16px] !mt-5 font-sans font-normal md:text-[18px] leading-[120%] text-[#fff]"
              style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
              Our care providers aren&apos;t just available — they&apos;re experienced,
              intentional, and invested in building real relationships with the
              dogs they care for.
            </p>

            <div className="!mt-6">
              <h3
                className=" text-[18px] !text-[#fff]  font-modern font-normal leading-[120%] mb-5  md:text-[20px] xl:text-[24px]"
               
              >
                Many are:
              </h3>

              <div className="space-y-3">
                {caregiverTypes.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 !mt-5 transition-all duration-700`}
                    style={{
                      transitionDelay: `${(index + 1) * 100}ms`,
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible
                        ? "translateX(0)"
                        : "translateX(-20px)",
                    }}
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <p    
                      className="text-[18px] font-['Modern_Sans']  font-normal md:text-[18px] leading-[120%]  text-[#CFD8E2]"
                     
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <p
              className="text-[16px] !mt-5 font-sans font-normal md:text-[18px] leading-[120%] text-[#fff]"
              style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
              We prioritize heart, patience, and experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
