"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useFindCareHref } from "@/hooks/use-find-care-href";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const findCareHref = useFindCareHref();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="header-main py-5 px-0 w-full bg-[#F6F2EA] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="header-row flex items-center justify-between h-20">
            <Link href="/" className="logo flex items-center">
              <Image
                src="/logo.png"
                alt="PawPair Logo"
                width={229}
                max-width={229}
                height={72}
                className="h-12 w-auto"
                priority
              />
            </Link>

            <nav className="navigation hidden nav:flex items-center space-x-[49px] md:space-x-[15px] lg:space-x-[49px]">
              <button
                type="button"
                onClick={() => scrollToSection("about")}
                aria-label="Scroll to About section"
                className="font-normal text-[18px] leading-[18px] text-black m-0 font-modern md:text-[14px] lg:text-[18px] hover:opacity-70 transition-opacity"
              >
                About
              </button>
              <Link
                href="/auth/caregiver-signup"
                className="text-[#000000] font-modern font-normal text-[18px] leading-[100%] hover:opacity-70 transition-opacity"
              >
                Find a Provider
              </Link>
              <button
                type="button"
                onClick={() => scrollToSection("contact")}
                aria-label="Scroll to Contact section"
                className="font-normal text-[18px] leading-[18px] text-black m-0 font-modern md:text-[14px] lg:text-[18px] hover:opacity-70 transition-opacity"
              >
                Contact
              </button>
              <Link
                href={findCareHref}
                aria-label="Create your dog's profile and find care"
                className="px-6 py-3 bg-[#5F7E9D] text-white font-modern font-normal text-[18px] leading-[100%] rounded-[10px] border-2 border-transparent hover:bg-white md:text-[14px] hover:text-[#5F7E9D] m-0 hover:border-[#5F7E9D] transition-all duration-300"
              >
                Create Your Dog's Profile
              </Link>
            </nav>

            {/* Hamburger icon - only visible below 999px and when menu is closed */}
            {!isMenuOpen && (
              <button
                onClick={toggleMenu}
                className="nav:hidden p-2 text-[#000000] hover:opacity-70 transition-opacity"
                aria-label="Open menu"
              >
                <Menu className="h-7 w-7" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Full-screen mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-[#F6F2EA] transition-all duration-500 ease-in-out nav:hidden ${
          isMenuOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Close button inside overlay */}
        <button
          onClick={toggleMenu}
          className="absolute top-[38px] right-[16px] sm:right-[24px] p-2 text-[#000000] hover:opacity-70 transition-opacity"
          aria-label="Close menu"
        >
          <X className="h-7 w-7" />
        </button>

        <nav className="flex flex-col items-center justify-center h-full gap-2 px-8">
          <button
            type="button"
            onClick={() => scrollToSection("about")}
            aria-label="Scroll to About section"
            className={`text-[#2F3E4E] font-modern font-normal text-[32px] leading-[100%] py-5 hover:text-[#5F7E9D] transition-all duration-500 ${
              isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: isMenuOpen ? "150ms" : "0ms" }}
          >
            About
          </button>

          <div
            className={`w-16 h-[1px] bg-[#2F3E4E]/15 transition-all duration-500 ${
              isMenuOpen ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            }`}
            style={{ transitionDelay: isMenuOpen ? "200ms" : "0ms" }}
          />

          <Link
            href="/auth/caregiver-signup"
            onClick={() => setIsMenuOpen(false)}
            className={`text-[#2F3E4E] font-modern font-normal text-[32px] leading-[100%] py-5 hover:text-[#5F7E9D] transition-all duration-500 ${
              isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: isMenuOpen ? "250ms" : "0ms" }}
          >
            Find a Provider
          </Link>

          <div
            className={`w-16 h-[1px] bg-[#2F3E4E]/15 transition-all duration-500 ${
              isMenuOpen ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
            }`}
            style={{ transitionDelay: isMenuOpen ? "300ms" : "0ms" }}
          />

          <button
            type="button"
            onClick={() => scrollToSection("contact")}
            aria-label="Scroll to Contact section"
            className={`text-[#2F3E4E] font-modern font-normal text-[32px] leading-[100%] py-5 hover:text-[#5F7E9D] transition-all duration-500 ${
              isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: isMenuOpen ? "350ms" : "0ms" }}
          >
            Contact
          </button>

          <Link
            href={findCareHref}
            onClick={() => setIsMenuOpen(false)}
            aria-label="Create your dog's profile and find care"
            className={`mt-8 w-full max-w-[320px] text-center px-8 py-4 bg-[#5F7E9D] text-white font-modern font-normal text-[20px] leading-[100%] rounded-[14px] border-2 border-transparent hover:bg-white hover:text-[#5F7E9D] hover:border-[#5F7E9D] transition-all duration-500 ${
              isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: isMenuOpen ? "450ms" : "0ms" }}
          >
            Create Your Dog's Profile
          </Link>
        </nav>
      </div>
    </>
  );
}
