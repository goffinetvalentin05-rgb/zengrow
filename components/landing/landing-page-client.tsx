"use client";

import { LocaleProvider } from "./locale-provider";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PageCanvas } from "./PageCanvas";
import { Hero } from "./sections/Hero";
import { ProblemSection } from "./sections/ProblemSection";
import { FeaturesSection } from "./sections/FeaturesSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
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
          <FeaturesSection />
          <HowItWorksSection />
        </main>
        <div className="go-close" id="faq">
          <FinalCtaSection />
          <Footer variant="close" />
        </div>
      </div>
    </LocaleProvider>
  );
}
