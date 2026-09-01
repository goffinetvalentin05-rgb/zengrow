"use client";

import { LocaleProvider } from "./locale-provider";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { PageCanvas } from "./PageCanvas";
import { Hero } from "./sections/Hero";
import { NicheBand } from "./NicheBand";
import { ProblemSection } from "./sections/ProblemSection";
import { AnswerSection } from "./sections/AnswerSection";
import { DifferenceSection } from "./sections/DifferenceSection";
import { ProfileSection } from "./sections/ProfileSection";
import { PricingSection } from "./sections/PricingSection";
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
          <NicheBand />
          <ProblemSection />
          <AnswerSection />
          <DifferenceSection />
          <ProfileSection />
          <PricingSection />
          <FAQSection />
          <FinalCtaSection />
        </main>
        <Footer />
      </div>
    </LocaleProvider>
  );
}
