"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import { NeonArc } from "@/components/sections/Hero";
import { Reveal } from "@/components/sections/Reveal";

export function CTA() {
  return (
    <section id="cta" className="relative w-full overflow-hidden bg-landing-bg pb-28 pt-24 sm:pb-36 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_45%,rgba(255,107,44,0.12),transparent)]" />

      {/* Halo ovale derrière le contenu */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <NeonArc align="center" />
      </div>

      {/* Léger voile pour garder le texte lisible sur le glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-landing-bg/55 via-landing-bg/25 to-landing-bg/65" />

      <div className="relative z-10 mx-auto flex min-h-[min(72vh,640px)] w-full max-w-3xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 sm:py-28">
        <Reveal className="flex w-full flex-col items-center">
          <div className="mb-8 flex size-16 items-center justify-center rounded-full border border-landing-accent/45 bg-landing-card/85 text-landing-accent-soft shadow-[0_0_55px_10px_rgba(255,107,44,0.4)] backdrop-blur-sm">
            <UtensilsCrossed className="size-8" strokeWidth={1.25} />
          </div>
          <h2
            className="max-w-2xl font-landing-serif text-[clamp(2rem,4.5vw,3.25rem)] font-normal leading-tight text-landing-fg [text-shadow:0_2px_28px_rgba(10,8,6,0.75)]"
          >
            Prêt à transformer ta page en <em className="italic text-landing-accent">machine à réservations</em> ?
          </h2>
          <p className="mt-5 max-w-xl text-landing-muted [text-shadow:0_1px_18px_rgba(10,8,6,0.65)]">
            Rejoins les restaurants qui ont arrêté de perdre des clients.
          </p>
          <Link
            href="/#pricing"
            className="mt-10 inline-flex min-h-12 items-center justify-center rounded-full bg-landing-accent px-8 text-sm font-semibold text-white shadow-[0_0_48px_-10px_rgba(255,107,44,0.85)] transition hover:brightness-110"
          >
            Démarrer maintenant
          </Link>
        </Reveal>
      </div>

      <motion.div
        className="pointer-events-none absolute bottom-2 left-1/2 z-[5] w-[120vw] max-w-none -translate-x-1/2 select-none text-center font-landing-serif text-[clamp(5rem,16vw,11rem)] font-normal italic leading-none text-[#FF6B2C]"
        style={{ opacity: 0.08 }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.08 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        aria-hidden
      >
        ZENGROW
      </motion.div>
    </section>
  );
}
