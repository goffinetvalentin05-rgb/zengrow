"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroProductCards } from "@/components/landing/HeroProductCards";
import { LandingBadge } from "@/components/landing/landing-ui";
import { Reveal } from "@/components/sections/Reveal";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-x-hidden pb-20 pt-[7.5rem] sm:pb-28 sm:pt-[9.5rem] lg:pt-[10.5rem]"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <LandingBadge>Page restaurant + IA</LandingBadge>
        </motion.div>

        <motion.h1
          className="mt-8 max-w-[18ch] font-landing-serif text-[clamp(2rem,6.5vw,3.5rem)] font-normal leading-[1.08] text-[#FFF7EF] sm:mt-10 sm:max-w-none"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          L&apos;<em className="not-italic text-[#FF7A3D]">IA</em> qui transforme vos visiteurs en{" "}
          <em className="italic text-[#FF7A3D]">réservations</em>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-2xl text-sm leading-relaxed text-[#AFA39A] sm:text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16 }}
        >
          ZenGrow crée une page restaurant pensée pour faire réserver, puis utilise l&apos;IA pour
          relancer vos clients, générer vos campagnes et récolter plus d&apos;avis Google.
        </motion.p>

        <motion.div
          className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.24 }}
        >
          <Link
            href="/signup"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF5A2A] px-8 text-sm font-semibold text-white shadow-[0_0_48px_-8px_rgba(255,90,42,0.85)] transition hover:bg-[#FF7A3D] hover:shadow-[0_0_56px_-6px_rgba(255,122,61,0.9)] hover:brightness-105"
          >
            Commencer maintenant
          </Link>
          <Link
            href="/#ia"
            className="landing-btn-secondary inline-flex min-h-12 items-center justify-center rounded-full px-8 text-sm font-medium"
          >
            Voir une démo
          </Link>
        </motion.div>

        <motion.p
          className="mt-6 text-xs text-[#AFA39A]/90 sm:text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.32 }}
        >
          Sans site compliqué. Sans outils dispersés. Tout au même endroit.
        </motion.p>
      </div>

      <Reveal className="relative z-10 mx-auto mt-16 w-full max-w-6xl px-4 sm:mt-24 sm:px-6">
        <HeroProductCards />
      </Reveal>
    </section>
  );
}
