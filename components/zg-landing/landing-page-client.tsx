"use client";

import { zgBody, zgDisplay } from "@/components/zg-landing/fonts";
import { BenefitsSection } from "@/components/zg-landing/sections/BenefitsSection";
import { ChatGPTSection } from "@/components/zg-landing/sections/ChatGPTSection";
import { FAQSection } from "@/components/zg-landing/sections/FAQSection";
import { FinalCTASection } from "@/components/zg-landing/sections/FinalCTASection";
import { Footer } from "@/components/zg-landing/sections/Footer";
import { HeroSection } from "@/components/zg-landing/sections/HeroSection";
import { HowItWorksSection } from "@/components/zg-landing/sections/HowItWorksSection";
import { Navbar } from "@/components/zg-landing/sections/Navbar";
import { PricingSection } from "@/components/zg-landing/sections/PricingSection";
import { ProblemSection } from "@/components/zg-landing/sections/ProblemSection";
import { TradesSection } from "@/components/zg-landing/sections/TradesSection";
import { AnimatedBackground } from "@/components/zg-landing/AnimatedBackground";
import "@/components/zg-landing/landing.css";
import "@/components/zg-landing/landing-v4.css";
import "@/components/zg-landing/landing-glass-3d.css";

export function LandingPageClient() {
  return (
    <div className={`zg-landing zg-landing--v4 ${zgDisplay.variable} ${zgBody.variable}`}>
      <AnimatedBackground />
      <Navbar />
      <main className="zg-landing__main">
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <TradesSection />
        <BenefitsSection />
        <PricingSection />
        <ChatGPTSection />
        <FinalCTASection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
