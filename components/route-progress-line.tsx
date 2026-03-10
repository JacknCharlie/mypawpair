"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

export function RouteProgressLine() {
  const lineRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (!lineRef.current) return;

    const line = lineRef.current;

    // Skip on first mount to avoid flash
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // When pathname changes = navigation complete
    gsap.killTweensOf(line);
    gsap.set(line, { scaleX: 1, opacity: 1 });
    gsap.to(line, {
      scaleX: 1,
      duration: 0.2,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(line, {
          opacity: 0,
          duration: 0.2,
          onComplete: () => {
            gsap.set(line, { scaleX: 0 });
          },
        });
      },
    });
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest("a");
      if (!target?.href || target.target === "_blank" || target.download) return;
      if (!target.href.startsWith(window.location.origin)) return;
      if (target.href === window.location.href) return;

      if (lineRef.current) {
        gsap.killTweensOf(lineRef.current);
        gsap.set(lineRef.current, { scaleX: 0, opacity: 1 });
        gsap.to(lineRef.current, {
          scaleX: 0.9,
          duration: 0.5,
          ease: "power2.inOut",
        });
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return (
    <div
      ref={lineRef}
      className="fixed top-0 left-0 right-0 h-[3px] bg-[#5F7E9D] z-[9999] origin-left"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
