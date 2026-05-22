import type { Metadata } from "next";
import { LandingGlobalBackground } from "@/components/landing/LandingGlobalBackground";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { AITrend } from "@/components/sections/AITrend";
import { Solution } from "@/components/sections/Solution";
import { AIConcrete } from "@/components/sections/AIConcrete";
import { FeaturesGrid } from "@/components/sections/FeaturesGrid";
import { Tarifs } from "@/components/sections/Tarifs";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "ZenGrow — Remplissez votre restaurant grâce à l'IA",
  description:
    "ZenGrow crée votre page de réservation, relance vos anciens clients, génère vos campagnes marketing et vous aide à récolter plus d'avis Google pour inspirer confiance et remplir vos tables plus souvent.",
};

export default function Home() {
  return (
    <div
      className="landing-page relative min-h-screen overflow-x-hidden text-[#EEF6FF] antialiased"
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
          <AITrend />
          <Solution />
          <AIConcrete />
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
