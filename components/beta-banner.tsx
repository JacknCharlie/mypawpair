"use client";

export function BetaBanner() {
  return (
    <div className=" d-none w-full bg-[#F3B443] text-white py-2.5 px-4 text-center">
      <p className="font-inter font-medium text-[14px] md:text-[16px] leading-tight">
        <span className="inline-block px-2 py-0.5 bg-white/20 rounded font-semibold mr-2">
          BETA
        </span>
        You&apos;re viewing myPawPair Beta — our staging environment. This product is in active development. Your feedback helps us improve!
      </p>
    </div>
  );
}
