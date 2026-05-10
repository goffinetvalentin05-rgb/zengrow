"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import { NeonArc } from "@/components/sections/Hero";
import { Reveal } from "@/components/sections/Reveal";

export function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-landing-bg pb-32 pt-20 sm:pb-40 sm:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(255,107,44,0.14),transparent)]" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <Reveal className="flex flex-col items-center">
          <div className="mb-8 flex size-16 items-center justify-center rounded-full border border-landing-accent/45 bg-landing-card/80 text-landing-accent-soft shadow-[0_0_55px_10px_rgba(255,107,44,0.4)]">
            <UtensilsCrossed className="size-8" strokeWidth={1.25} />
          </div>
          <h2 className="font-landing-serif text-[clamp(2rem,4.5vw,3.25rem)] font-normal leading-tight text-landing-fg">
            Prêt à transformer ta page en <em className="italic text-landing-accent">machine à réservations</em> ?
          </h2>
          <p className="mt-5 text-landing-muted">
            Rejoins les restaurants qui ont arrêté de perdre des clients.
          </p>
          <Link
            href="#tarifs"
            className="mt-10 inline-flex min-h-12 items-center justify-center rounded-xl bg-landing-accent px-8 text-sm font-semibold text-white shadow-[0_0_48px_-10px_rgba(255,107,44,0.85)] transition hover:brightness-110"
          >
            Démarrer maintenant
          </Link>
        </Reveal>
      </div>

      <div className="relative z-20 mx-auto mt-16 h-[min(38vw,420px)] w-full max-w-[1400px]">
        <NeonArc flip />
      </div>

      <motion.div
        className="pointer-events-none absolute -bottom-4 left-1/2 z-0 w-[120vw] max-w-none -translate-x-1/2 translate-y-1/4 select-none text-center font-landing-serif text-[clamp(6rem,18vw,12rem)] font-normal italic leading-none text-[#FF6B2C]"
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
