"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Minus } from "lucide-react";

export function FAQSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
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

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Is it normal that my puppy sleeps 18 hours a day?",
      answer:
        "Yes, it's completely normal! Puppies need lots of sleep for healthy growth and development. Young puppies (8-12 weeks) can sleep 18-20 hours per day. As they grow, this will gradually decrease to 12-14 hours by adulthood.",
    },
    {
      question: "What food is best for a 6-month Golden with a sensitive stomach?",
      answer:
        "For a Golden Retriever with a sensitive stomach, look for limited ingredient diets with easily digestible proteins like chicken, turkey, or salmon. Avoid foods with corn, wheat, or soy. Consider brands specifically formulated for sensitive stomachs and introduce new foods gradually over 7-10 days.",
    },
    {
      question: "How do I stop leash pulling?",
      answer:
        "Start with positive reinforcement training. Stop walking when your dog pulls and only move forward when the leash is loose. Reward your dog frequently for walking beside you. Consider using a front-clip harness for better control and practice in low-distraction areas first.",
    },
    {
      question: "How do I stop my dog from pulling on the leash during walks?",
      answer:
        "Use the 'stop and go' method: when your dog pulls, stop immediately and wait. Only continue walking when they return to your side and the leash is slack. Consistency is key. You can also try the 'reverse direction' technique where you turn and walk the opposite way whenever pulling occurs.",
    },
    {
      question: "How often should I take my dog to the vet?",
      answer:
        "Adult dogs should visit the vet at least once a year for a wellness check and vaccinations. Puppies need more frequent visits (every 3-4 weeks until 16 weeks old). Senior dogs (7+ years) benefit from twice-yearly checkups. Always consult your vet if you notice any health concerns.",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="w-full py-[60px] md:py-[80px] bg-[#F6F2EA]"
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-[40px] lg:gap-[60px] xl:gap-[80px]">
          {/* Left Side - Title and Description */}
          <div
            className={`w-full lg:max-w-[400px] xl:max-w-[450px] transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-10"
            }`}
          >
            <h2 className="font-['Modern_Sans'] font-normal text-[27px] md:text-[36px] lg:text-[40px] xl:text-[46px] leading-[120%] text-[#2F3E4E]">
              Ask myPawPair Anything
            </h2>
            <p
              className="font-inter font-normal text-[18px] leading-[120%] text-[#4A5563] mt-[20px]"
             
            >
              myPawPair AI is your personal dog care assistant, ready to help
              anytime. Ask questions about your dog's health, behavior,
              nutrition, or training and get instant answers tailored to your
              dog's breed, age, and personality.
            </p>
          </div>

          {/* Right Side - FAQ Items */}
          <div
            className={`w-full flex-1 space-y-4 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-10"
            }`}
          >
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`bg-[#DFE5EB] rounded-[12px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="font-inter font-mediuml text-[18px] md:text-[20px] leading-[120%] tracking-[-0.5px] text-[#4A5563] pr-4">
                    {faq.question}
                  </span>

         
                  <div className=" accordion-btn flex-shrink-0 w-6 h-6 flex items-center justify-center text-[#5F7E9D]">
                    {openIndex === index ? (
                      <Minus className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? "max-h-[500px]" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-4 pt-2">
                    <p
                      className="font-inter font-normal text-[16px] leading-[140%] text-[#4A5563]"
                      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
