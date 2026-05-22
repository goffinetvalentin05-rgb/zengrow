import { AnimatedBackground } from "@/components/landing-page/AnimatedBackground";
import { landingBody, landingDisplay } from "@/components/landing-page/fonts";
import { AITrendSection } from "@/components/landing-page/sections/AITrendSection";
import { AIConcreteSection } from "@/components/landing-page/sections/AIConcreteSection";
import { CTASection } from "@/components/landing-page/sections/CTASection";
import { FAQSection } from "@/components/landing-page/sections/FAQSection";
import { FeaturesSection } from "@/components/landing-page/sections/FeaturesSection";
import { Footer } from "@/components/landing-page/sections/Footer";
import { HeroSection } from "@/components/landing-page/sections/HeroSection";
import { Navbar } from "@/components/landing-page/sections/Navbar";
import { PricingSection } from "@/components/landing-page/sections/PricingSection";
import { ProblemSection } from "@/components/landing-page/sections/ProblemSection";
import { SolutionSection } from "@/components/landing-page/sections/SolutionSection";
import "@/components/landing-page/landing.css";

export function LandingPage() {
  return (
    <div
      className={`zg-landing-v3 zg-lp-body ${landingDisplay.variable} ${landingBody.variable}`}
    >
      <AnimatedBackground />
      <Navbar />
      <main className="zg-landing-v3__main">
        <HeroSection />
        <ProblemSection />
        <AITrendSection />
        <SolutionSection />
        <AIConcreteSection />
        <FeaturesSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
