"use client";

import { fitmeBody, fitmeDisplay } from "./fonts";
import { Navbar } from "./sections/Navbar";
import { HeroSection } from "./sections/HeroSection";
import { BeforeAfterSection } from "./sections/BeforeAfterSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { StyleProfileSection } from "./sections/StyleProfileSection";
import { OfferSection } from "./sections/OfferSection";
import { Footer } from "./sections/Footer";
import "./fitme.css";

export function LandingPageClient() {
  return (
    <div className={`fitme ${fitmeDisplay.variable} ${fitmeBody.variable}`}>
      <Navbar />
      <main>
        <HeroSection />
        <BeforeAfterSection />
        <HowItWorksSection />
        <StyleProfileSection />
        <OfferSection />
      </main>
      <Footer />
    </div>
  );
}
