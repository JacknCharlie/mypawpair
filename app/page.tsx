import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BetaBanner } from "@/components/beta-banner";
import { HeroSection } from "@/components/hero-section";
import { CaregiverSection } from "@/components/caregiver-section";
import { TimelineSection } from "@/components/timeline-section";
import { EnergyMatchSection } from "@/components/energy-match-section";
import { PuppyFirstYearSection } from "@/components/puppy-first-year-section";
// import { CaregiversSection } from "@/components/caregivers-section";
import { FamilyCareSection } from "@/components/family-care-section";
import { FAQSection } from "@/components/faq-section";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <BetaBanner />
      <HeroSection />
      <CaregiverSection />
      <TimelineSection />
      <EnergyMatchSection />
     
      <PuppyFirstYearSection />
     
      <FamilyCareSection />
      {/* <CaregiversSection /> */}
      <FAQSection />
      <Footer />
    </main>
  );
}
