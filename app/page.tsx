import type { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Globe } from "@/components/sections/Globe";
import { Connected } from "@/components/sections/Connected";
import { Solutions } from "@/components/sections/Solutions";
import { Testimonials } from "@/components/sections/Testimonials";
import { Tarifs } from "@/components/sections/Tarifs";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "ZenGrow — Page web pro & réservation pour restaurants",
  description:
    "ZenGrow crée des pages web professionnelles avec réservation intégrée pour les restaurants. Conversion, design premium, sans friction.",
};

export default function Home() {
  return (
    <div
      className="min-h-screen bg-landing-bg text-landing-fg antialiased"
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <Navbar />
      <main>
        <Hero />
        <Globe />
        <Connected />
        <Solutions />
        <Testimonials />
        <Tarifs />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
