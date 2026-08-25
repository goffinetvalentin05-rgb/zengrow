"use client";

import { motion } from "framer-motion";
import {
  LandingPrimaryButton,
  LandingSecondaryButton,
} from "@/components/landing/landing-ui";
import { Reveal } from "@/components/sections/Reveal";

export function CTA() {
  return (
    <section id="cta" className="relative w-full overflow-hidden pb-20 pt-24 sm:pb-28 sm:pt-32">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[min(420px,70vw)] -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(43,140,255,0.12),transparent_65%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-16">
        <Reveal className="flex w-full flex-col items-center">
          <h2 className="max-w-2xl font-landing-serif text-[clamp(1.85rem,4.5vw,3rem)] font-normal leading-tight text-[#EEF6FF]">
            Faites revenir vos clients. Remplissez vos tables.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#8BA3C7]">
            Avec ZenGrow, votre restaurant dispose d&apos;une page de réservation, de relances IA, de
            campagnes marketing et d&apos;un système pour récolter plus d&apos;avis Google.
          </p>
          <div className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
            <LandingPrimaryButton href="/pro/signup">Commencer maintenant</LandingPrimaryButton>
            <LandingSecondaryButton href="/#ia">Voir une démo</LandingSecondaryButton>
          </div>
          <p className="mt-6 text-xs text-[#8BA3C7]/90 sm:text-sm">
            Simple à lancer. Pensé pour les restaurants. Propulsé par l&apos;IA.
          </p>
        </Reveal>
      </div>

      <motion.div
        className="pointer-events-none absolute bottom-0 left-1/2 z-[5] w-max max-w-[100vw] -translate-x-1/2 translate-y-[42%] select-none whitespace-nowrap text-center font-landing-serif text-[clamp(3.5rem,18vw,11rem)] font-normal italic leading-none sm:translate-y-[38%] sm:text-[clamp(4rem,15vw,12rem)]"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      >
        <span
          className="bg-gradient-to-b from-[rgba(43,140,255,0.32)] via-[rgba(30,80,160,0.14)] to-transparent bg-clip-text text-transparent"
          style={{ WebkitTextStroke: "1px rgba(59, 158, 255, 0.12)" }}
        >
          ZENGROW
        </span>
      </motion.div>
    </section>
  );
}
