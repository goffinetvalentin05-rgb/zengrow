import "@/components/landing-v2/landing-v2.css";
import { HeroBackground } from "@/components/landing-v2/HeroBackground";
import { LandingNavbar } from "@/components/landing-v2/Navbar";
import { LandingFooter } from "@/components/landing-v2/Footer";
import { HeroSection } from "@/components/landing-v2/sections/HeroSection";
import { ProblemSection } from "@/components/landing-v2/sections/ProblemSection";
import { AITrendSection } from "@/components/landing-v2/sections/AITrendSection";
import { SolutionSection } from "@/components/landing-v2/sections/SolutionSection";
import { AIConcreteSection } from "@/components/landing-v2/sections/AIConcreteSection";
import { FeaturesSection } from "@/components/landing-v2/sections/FeaturesSection";
import { PricingSection } from "@/components/landing-v2/sections/PricingSection";
import { FAQSection } from "@/components/landing-v2/sections/FAQSection";
import { CTASection } from "@/components/landing-v2/sections/CTASection";

export function LandingPageV2() {
  return (
    <div className="zg-landing">
      <HeroBackground />
      <LandingNavbar />
      <div className="zg-landing__main">
        <main>
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
        <LandingFooter />
      </div>
    </div>
  );
}
