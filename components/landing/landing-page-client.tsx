"use client";

import { LocaleProvider } from "./locale-provider";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PageCanvas } from "./PageCanvas";
import { Hero } from "./sections/Hero";
import { ProblemSection } from "./sections/ProblemSection";
import { DiscoverSection } from "./sections/DiscoverSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { FAQSection } from "./sections/FAQSection";
import { FinalCtaSection } from "./sections/FinalCtaSection";
import "./landing.css";

export function LandingPageClient() {
  return (
    <LocaleProvider>
      <div className="go">
        <PageCanvas />
        <Navbar />
        <main>
          <Hero />
          <ProblemSection />
          <DiscoverSection />
          <HowItWorksSection />
          <FAQSection />
          <FinalCtaSection />
        </main>
        <Footer />
      </div>
    </LocaleProvider>
  );
}
