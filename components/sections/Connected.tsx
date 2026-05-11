"use client";

import { DashboardMockup } from "@/components/sections/DashboardMockup";
import { Reveal } from "@/components/sections/Reveal";

export function Connected() {
  return (
    <section id="features" className="relative bg-landing-bg py-24 sm:py-28">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(2rem,4vw,3rem)] font-normal text-landing-fg">
            Et derrière, une <em className="italic text-landing-accent">vraie plateforme</em> business
          </h2>
          <p className="mt-4 text-landing-muted">
            ZenGrow, c&apos;est bien plus qu&apos;une page web. Une fois le client réservé, tout un système se met en
            marche pour faire grandir ton resto.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <DashboardMockup />
        </Reveal>
      </div>
    </section>
  );
}
