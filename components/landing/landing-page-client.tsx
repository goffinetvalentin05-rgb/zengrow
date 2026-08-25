"use client";

import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { StorySection } from "./StorySection";
import { HowItWorksSection } from "./HowItWorksSection";
import { FAQSection } from "./FAQSection";
import { FinalCTA } from "./FinalCTA";
import { Footer } from "./Footer";
import "./landing.css";

export function LandingPageClient() {
  return (
    <div className="go">
      <div className="go-grain" aria-hidden />
      <Navbar />
      <main>
        <Hero />
        <div className="go-day">
          <StorySection />
          <HowItWorksSection />
          <FAQSection />
        </div>
      </main>
      <div className="go-close">
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
