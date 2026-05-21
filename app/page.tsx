import type { Metadata } from "next";
import { LandingGlobalBackground } from "@/components/landing/LandingGlobalBackground";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Credibility } from "@/components/sections/Credibility";
import { Solution } from "@/components/sections/Solution";
import { IAExample } from "@/components/sections/IAExample";
import { FeaturesGrid } from "@/components/sections/FeaturesGrid";
import { Tarifs } from "@/components/sections/Tarifs";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "ZenGrow — Remplissez votre restaurant grâce à l'IA",
  description:
    "ZenGrow crée votre page de réservation, relance les clients qui ne reviennent plus et génère vos campagnes marketing pour remplir vos tables plus souvent.",
};

export default function Home() {
  return (
    <div
      className="landing-page relative min-h-screen overflow-x-hidden text-[#FFF7EF] antialiased"
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <LandingGlobalBackground />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <Problem />
          <Solution />
          <IAExample />
          <Credibility />
          <FeaturesGrid />
          <Tarifs />
          <FAQ />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}
