import { AnimatedBackground } from "@/components/landing-page/AnimatedBackground";
import { landingBody, landingDisplay } from "@/components/landing-page/fonts";
import { AIAssistantSection } from "@/components/landing-page/sections/AIAssistantSection";
import { AITrendSection } from "@/components/landing-page/sections/AITrendSection";
import { BenefitsSection } from "@/components/landing-page/sections/BenefitsSection";
import { ComparisonSection } from "@/components/landing-page/sections/ComparisonSection";
import { CTASection } from "@/components/landing-page/sections/CTASection";
import { DiscoverySection } from "@/components/landing-page/sections/DiscoverySection";
import { FAQSection } from "@/components/landing-page/sections/FAQSection";
import { FeaturesSection } from "@/components/landing-page/sections/FeaturesSection";
import { Footer } from "@/components/landing-page/sections/Footer";
import { HeroSection } from "@/components/landing-page/sections/HeroSection";
import { Navbar } from "@/components/landing-page/sections/Navbar";
import { PricingSection } from "@/components/landing-page/sections/PricingSection";
import { ThreeMomentsSection } from "@/components/landing-page/sections/ThreeMomentsSection";
import { WhySection } from "@/components/landing-page/sections/WhySection";
import "@/components/landing-page/landing.css";

export function LandingPage() {
  return (
    <div
      className={`zg-landing zg-lp-body ${landingDisplay.variable} ${landingBody.variable}`}
    >
      <AnimatedBackground />
      <Navbar />
      <main className="zg-landing__main">
        <HeroSection />
        <DiscoverySection />
        <AITrendSection />
        <ThreeMomentsSection />
        <BenefitsSection />
        <FeaturesSection />
        <AIAssistantSection />
        <WhySection />
        <ComparisonSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
