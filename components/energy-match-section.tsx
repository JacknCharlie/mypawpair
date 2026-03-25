"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function EnergyMatchSection() {
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

  const criteria = [
    "Breed insights",
    "Health conditions",
    "Diet preferences",
    "Behavioral patterns",
    "Activity levels",
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full py-[60px] md:py-[70px] lg:py-[80px] bg-white"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[40px] items-center">
          <div
            className={`space-y-8 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <h2
              className="font-['Modern_Sans'] font-normal text-[27px] md:text-[36px] lg:text-[40px] xl:text-[46px] leading-[120%] text-[#2F3E4E]"
               
            >
              A Care Profile Built Around Your Dog
            </h2>

            <p
              className="text-[16px] !mt-5 font-sans font-normal md:text-[18px] leading-[120%] text-[#4A5563]"
              style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
            The more you tell myPawPair about your dog, the smarter it gets.  Every answer is personalized to your dog's breed, age, health history, and personality.
            </p>

            <div className="!mt-6">
              <h3
                className=" text-[18px] !text-[#000000]  font-modern font-normal leading-[120%] mb-5  md:text-[20px] xl:text-[24px]"
              >
                Your dog's profile gets smarter over time.  
              </h3>

              <div className="space-y-3">
                {criteria.map((item, index) => (
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
                    <div className="w-5 h-5 rounded-full border-2 border-[#5F7E9D] flex items-center justify-center flex-shrink-0">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#5F7E9D]" />
                    </div>
                    <p
                      className="text-[18px] font-['Modern_Sans']  font-normal md:text-[18px] leading-[120%] text-[rgba(18,18,18,0.7)]"
                      
                    >
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
             This allows myPawPair to give advice tailored specifically to your dog.
            </p>
          </div>

          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
              <div className="relative w-full md:max-w-full lg:max-w-[600px] mx-auto lg:ml-auto">
                <Image
                  src="/caredog.png"
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
