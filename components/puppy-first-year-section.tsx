"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const milestones = [
  {
    label: "Week 1-4",
    description: "Early bonding & sleep routines",
  },
  {
    label: "Week 5-8",
    description: "Socialization begins",
  },
  {
    label: "Week 9-12",
    description: "Basic training milestones",
  },
  {
    label: "Month 4-6",
    description: "Teething & behavior changes",
  },
  {
    label: "Month 7-12",
    description: "Confidence & routine building",
  },
];

export function PuppyFirstYearSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const pawsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const loadGsap = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      if (!sectionRef.current) return;

      const ctx = gsap.context(() => {
        // Line grows from top to bottom on scroll
        if (lineRef.current) {
          gsap.fromTo(
            lineRef.current,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              transformOrigin: "top center",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 60%",
                end: "bottom 80%",
                scrub: 1,
              },
            }
          );
        }

        // Cards, dots, and paws reveal one by one on scroll
        cardsRef.current.forEach((card, index) => {
          if (!card) return;
          
          // Card slides in from right
          gsap.fromTo(
            card,
            { opacity: 0, x: 60 },
            {
              opacity: 1,
              x: 0,
              duration: 0.6,
              ease: "power2.out",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            }
          );

          // Dot appears
          const dot = dotsRef.current[index];
          if (dot) {
            gsap.fromTo(
              dot,
              { scale: 0, opacity: 0 },
              {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: "back.out(1.7)",
                scrollTrigger: {
                  trigger: card,
                  start: "top 85%",
                  toggleActions: "play none none reverse",
                },
                delay: 0.2,
              }
            );
          }

          // Paw bounces in
          const paw = pawsRef.current[index];
          if (paw) {
            gsap.fromTo(
              paw,
              { scale: 0, opacity: 0, rotation: -20 },
              {
                scale: 1,
                opacity: 1,
                rotation: 0,
                duration: 0.5,
                ease: "back.out(1.7)",
                scrollTrigger: {
                  trigger: card,
                  start: "top 85%",
                  toggleActions: "play none none reverse",
                },
                delay: 0.35,
              }
            );
          }
        });

        // Left column fades in
        const leftCol = sectionRef.current?.querySelector(".puppy-left-col");
        if (leftCol) {
          gsap.fromTo(
            leftCol,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: "power2.out",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
            }
          );
        }

        // Bone icon rotates in
        const boneIcon = sectionRef.current?.querySelector(".bone-icon");
        if (boneIcon) {
          gsap.fromTo(
            boneIcon,
            { opacity: 0, scale: 0, rotation: -30 },
            {
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 0.7,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 70%",
                toggleActions: "play none none reverse",
              },
              delay: 0.3,
            }
          );
        }
      }, sectionRef);

      return () => ctx.revert();
    };

    loadGsap();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full py-[60px] md:py-[70px] lg:py-[80px] bg-[#5F7E9D] relative overflow-hidden"
    >
      <div className="week-by-week-main max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16 items-stretch">

          {/* ══════════ LEFT 70% — Heading + Text + Image ══════════ */}
          <div className="puppy-left-col w-full lg:w-[70%] flex flex-col">
            {/* Heading */}
            <h2 className="font-['Modern_Sans'] font-normal text-[32px] md:text-[40px] lg:text-[44px] xl:text-[50px] leading-[120%] text-white mb-5">
              Your Puppy&apos;s First Year —{" "}
              <span className="inline">Guided Week by Week</span>
            </h2>

            {/* Description paragraphs */}
            <p
              className="text-[15px] md:text-[16px] leading-[145%] text-white/85 mb-3"
              style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
              The first year of a dog&apos;s life is full of important milestones.
            </p>
            <p
              className="text-[15px] md:text-[16px] leading-[145%] text-white/85 mb-8"
              style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
            >
              myPawPair guides new dog parents through every stage with weekly insights,
              reminders, and tips tailored to your puppy&apos;s development.
            </p>

            {/* kidcare.png image */}
            <div className="relative w-full flex-1">
              <Image
                src="/kidcare.png"
                alt="Girl bonding with puppy on sofa"
                width={700}
                height={480}
                className="w-full h-full max-h-[480px] rounded-[18px] shadow-2xl object-cover"
              />
            </div>
          </div>

          {/* ══════════ RIGHT 30% — Bone + Cards + Timeline ══════════ */}
          <div className="pupy-right-cols relative w-full lg:w-[30%] flex flex-col">
            {/* Bone icon — absolute top-right */}
            <div className=" bone-icon-top bone-icon absolute -top-2 right-[3px] w-[50px] h-[50px] md:w-[58px] md:h-[58px] lg:w-[64px] lg:h-[64px] z-20">
              <Image
                src="/bone.png"
                alt="Bone icon"
                fill
                className="object-contain"
              />
            </div>

            {/* Timeline container */}
            <div className="relative flex-1 pt-[5.5rem]">
              {/* Faded background line (track) */}
              <div
                className="absolute right-[28px] md:right-[32px] top-[28px] bottom-[28px] w-[3px] bg-white/20 rounded-full"
              />
              
              {/* Animated solid white line (fills on scroll) */}
              <div
                ref={lineRef}
                className="absolute right-[28px] md:right-[32px] top-[28px] bottom-[28px] w-[3px] bg-white rounded-full origin-top"
              />

              {/* Milestone cards */}
              <div className="space-y-4 md:space-y-5 pr-[70px] md:pr-[76px]">
                {milestones.map((item, index) => (
                  <div key={index} className="relative">
                    {/* White rounded card */}
                    <div
                      ref={(el) => { cardsRef.current[index] = el; }}
                      className="bg-white rounded-[20px] px-5 py-4 shadow-lg
                                 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 
                                 cursor-default relative group"
                    >
                      <h3 className=" text-[18px] !text-[#000000]  font-modern font-normal leading-[120%] mb-5  md:text-[20px] xl:text-[24px] mb-[15px]">
                        {item.label}
                      </h3>
                      <p
                        className=" text-[18px] font-['Inter'] font-normal md:text-[18px] leading-[120%] text-[#4A5563]"
                        style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
                      >
                        {item.description}
                      </p>

                      {/* Right arrow pointer (speech bubble style) */}
                      <div className="absolute top-1/2 -translate-y-1/2 -right-[12px] w-0 h-0 
                                    border-t-[12px] border-t-transparent 
                                    border-b-[12px] border-b-transparent 
                                    border-l-[12px] border-l-white
                                    drop-shadow-md">
                      </div>
                    </div>

                    {/* Dot on timeline */}
                    <div
                      ref={(el) => { dotsRef.current[index] = el; }}
                      className="weekly-dots absolute top-1/2 -translate-y-1/2 right-[20px] md:right-[-51px] 
                                  w-[16px] h-[16px] rounded-full bg-white shadow-lg border-[3px] border-[#5F7E9D] z-10"
                    />

                    {/* Paw icon */}
                    <div
                      ref={(el) => { pawsRef.current[index] = el; }}
                      className=" weekly-hands absolute top-1/2 -translate-y-1/2 right-[-10px] md:right-[-115px]
                               w-[36px] h-[36px] md:w-[42px] md:h-[42px] z-10
                               transition-transform duration-300 hover:scale-110 hover:rotate-12"
                    >
                      <Image
                        src="/footstep.png"
                        alt="Paw print"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
