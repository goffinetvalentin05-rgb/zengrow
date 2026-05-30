"use client";

import { AnimatedBackground } from "@/components/zg-landing/AnimatedBackground";
import { LandingCanvasProvider, useLandingCanvas } from "@/components/zg-landing/landing-canvas-provider";
import { zgBody, zgDisplay } from "@/components/zg-landing/fonts";
import { AISection } from "@/components/zg-landing/sections/AISection";
import { FAQSection } from "@/components/zg-landing/sections/FAQSection";
import { Footer } from "@/components/zg-landing/sections/Footer";
import { HeroSection } from "@/components/zg-landing/sections/HeroSection";
import { Navbar } from "@/components/zg-landing/sections/Navbar";
import { PlatformSection } from "@/components/zg-landing/sections/PlatformSection";
import { PricingSection } from "@/components/zg-landing/sections/PricingSection";
import { ProblemSection } from "@/components/zg-landing/sections/ProblemSection";
import { WorkflowSection } from "@/components/zg-landing/sections/WorkflowSection";
import "@/components/zg-landing/landing.css";

export function LandingPageClient() {
  return (
    <LandingCanvasProvider>
      <LandingPageShell />
    </LandingCanvasProvider>
  );
}

function LandingPageShell() {
  const { resolvedCanvas } = useLandingCanvas();

  return (
    <div className={`zg-landing ${zgDisplay.variable} ${zgBody.variable}`} data-landing-canvas={resolvedCanvas}>
      <AnimatedBackground />
      <Navbar />
      <main className="zg-landing__main">
        <HeroSection />
        <ProblemSection />
        <WorkflowSection />
        <PlatformSection />
        <AISection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
