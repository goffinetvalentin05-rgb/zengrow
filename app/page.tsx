import type { Metadata } from "next";
import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { Solution } from "@/components/sections/Solution";
import { IAExample } from "@/components/sections/IAExample";
import { FeaturesGrid } from "@/components/sections/FeaturesGrid";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = {
  title: "ZenGrow — Page restaurant IA & réservations pour restaurants",
  description:
    "ZenGrow transforme vos visiteurs en réservations et aide votre restaurant à faire revenir vos clients grâce à l'IA : page mobile-first, relances, campagnes et avis Google.",
};

export default function Home() {
  return (
    <div
      className="landing-page min-h-screen overflow-x-hidden bg-[#050403] text-[#FFF7EF] antialiased"
      style={{
        fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <IAExample />
        <FeaturesGrid />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
