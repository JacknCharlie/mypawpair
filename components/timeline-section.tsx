"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [gsapLoaded, setGsapLoaded] = useState(false);

  useEffect(() => {
    const loadGsap = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      
      gsap.registerPlugin(ScrollTrigger);
      setGsapLoaded(true);

      if (!sectionRef.current || !lineRef.current) return;

      const ctx = gsap.context(() => {
        gsap.fromTo(
          lineRef.current,
          { height: "0%" },
          {
            height: "100%",
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top center",
              end: "bottom center",
              scrub: 1,
            },
          }
        );

        const items = gsap.utils.toArray(".timeline-item");
        items.forEach((item: any, index: number) => {
          gsap.fromTo(
            item,
            {
              opacity: 0,
              x: index % 2 === 0 ? -50 : 50,
            },
            {
              opacity: 1,
              x: 0,
              duration: 0.8,
              scrollTrigger: {
                trigger: item,
                start: "top 80%",
                end: "top 50%",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      }, sectionRef);

      return () => ctx.revert();
    };

    loadGsap();
  }, []);

  const timelineData = [
    {
      icon: "/ticons1.png",
      image: "/timeline1.png",
      title: "Create your dog's profile",
      description:
        "Tell myPawPair about your dog’s breed, age, health, and personality.",
      position: "left",
    },
    {
      icon: "/ticons2.png",
      image: "/timeline2.png",
      title: "Ask the AI anything",
      description:
        "Get instant guidance about training, nutrition, behavior, and care.",
      position: "right",
    },
    {
      icon: "/ticons3.png",
      image: "/timeline3.png",
      title: "Find trusted local providers",
      description:
        "When you need help, myPawPair connects you with verified trainers, groomers, walkers, and vets.",
      position: "left",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="how-mypawpair-works"
      aria-labelledby="how-mypawpair-works-heading"
      className="w-full py-[60px] bg-[#5F7E9D] relative overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
        <div className="text-center mb-16 md:mb-20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2
              id="how-mypawpair-works-heading"
              className="font-['Modern_Sans'] font-normal text-[27px] md:text-[36px] lg:text-[40px] xl:text-[46px] leading-[120%] text-[#fff]"
            >
              How myPawPair Works
            </h2>
          </div>
          <p
            className="text-[16px] font-sans font-normal md:text-[18px] leading-[120%] text-center text-[#fff]"
            style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
          >
            Start your dog&apos;s journey with the right match.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 hidden lg:block">
            <div className="w-full h-full" style={{
              backgroundImage: 'linear-gradient(to bottom, white 50%, transparent 50%)',
              backgroundSize: '2px 20px',
              backgroundRepeat: 'repeat-y',
              opacity: 0.3
            }} />
            <div
              ref={lineRef}
              className="absolute top-0 left-0 w-full origin-top"
              style={{ 
                height: "0%",
                backgroundImage: 'linear-gradient(to bottom, white 50%, transparent 50%)',
                backgroundSize: '2px 20px',
                backgroundRepeat: 'repeat-y'
              }}
            />
          </div>

          <div className="space-y-12 md:space-y-16 lg:space-y-24">
            {timelineData.map((item, index) => (
              <div
                key={index}
                className={`timeline-item time-line-row relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                  item.position === "right" ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`time-line-left ${
                    item.position === "right"
                      ? "lg:col-start-2 lg:pl-12"
                      : "lg:pr-12"
                  }`}
                >
                  <div className="relative w-full max-w-[400px] mx-auto lg:mx-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={400}
                      height={300}
                      className="w-full h-auto rounded-[20px] shadow-xl"
                    />
                  </div>
                </div>

                <div
                  className={`time-line-right relative ${
                    item.position === "right"
                      ? "lg:col-start-1 lg:row-start-1 lg:pr-12"
                      : "lg:pl-12"
                  }`}
                >
                  <div
                    className={`bg-[#F6F2EA] rounded-[20px] p-8 shadow-xl time-line-right-inner ${
                      item.position === "right" ? "lg:ml-auto" : ""
                    } max-w-[500px]`}
                  >
                    <div className="time-line-inner-blocks flex flex-col items-start gap-4  mb-[25px]">
                      <div className="relative w-[40px] h-[40px] md:w-[80px] md:h-[80px] flex-shrink-0" aria-hidden="true">
                        <Image
                          src={item.icon}
                          alt=""
                          fill
                          className="object-contain"
                        />
                      </div>
                      <h3
                        className=" text-[18px] !text-[#2F3E4E]  font-modern font-normal leading-[120%]  md:text-[20px] xl:text-[24px]"
                        
                      >
                        {item.title}
                      </h3>
                    </div>
                    <p
                      className="text-[16px] font-sans font-normal md:text-[18px] leading-[120%] text-[#4A5563]"
                      style={{
                        fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block z-10">
                  <div className="w-6 h-6 rounded-full bg-white border-4 border-[#5F7E9D] shadow-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
