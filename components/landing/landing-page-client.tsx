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
      <Navbar />
      <main>
        <Hero />
        <StorySection />
        <HowItWorksSection />
        <FAQSection />
      </main>
      <div className="go-close">
        <FinalCTA />
        <Footer />
      </div>
    </div>
  );
}
