"use client";

import { BrowserMockup } from "@/components/sections/BrowserMockup";
import { Reveal } from "@/components/sections/Reveal";

export function Globe() {
  return (
    <section id="demo" className="relative overflow-hidden bg-landing-section py-24 sm:py-28">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(2rem,4vw,3rem)] font-normal text-landing-fg">
            On a réinventé la page web <em className="italic text-landing-accent">restaurant</em>
          </h2>
          <p className="mt-4 text-landing-muted">
            Fini les sites vitrines statiques qui ne servent à rien. ZenGrow transforme ta présence en ligne en un
            véritable système de conversion, actif 24h/24, qui capte chaque visiteur et le transforme en réservation.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <BrowserMockup />
        </Reveal>
      </div>
    </section>
  );
}
