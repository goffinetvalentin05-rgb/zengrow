"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HeroOrbitDesktop, HeroOrbitMobile } from "@/components/landing/HeroProductCards";
import { LandingBadge } from "@/components/landing/landing-ui";

function HeroCopy() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <LandingBadge>Page restaurant + IA</LandingBadge>
      </motion.div>

      <motion.h1
        className="mt-7 font-landing-serif text-[clamp(2rem,5.5vw,3.35rem)] font-normal leading-[1.08] text-[#FFF7EF]"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        L&apos;<em className="not-italic text-[#FF7A3D]">IA</em> qui transforme vos visiteurs en{" "}
        <em className="italic text-[#FF7A3D]">réservations</em>
      </motion.h1>

      <motion.p
        className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-[#AFA39A] sm:text-base"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.14 }}
      >
        ZenGrow crée une page restaurant pensée pour faire réserver, puis utilise l&apos;IA pour relancer
        vos clients, générer vos campagnes et récolter plus d&apos;avis Google.
      </motion.p>

      <motion.div
        className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.22 }}
      >
        <Link
          href="/signup"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF5A2A] px-8 text-sm font-semibold text-white shadow-[0_0_48px_-8px_rgba(255,90,42,0.85)] transition hover:bg-[#FF7A3D] hover:shadow-[0_0_56px_-6px_rgba(255,122,61,0.9)]"
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
        className="mt-5 text-xs text-[#AFA39A]/85 sm:text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        Sans site compliqué. Sans outils dispersés. Tout au même endroit.
      </motion.p>
    </>
  );
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-x-hidden px-4 pb-16 pt-[7rem] sm:px-6 sm:pb-20 sm:pt-[8.5rem]"
    >
      {/* Scène desktop : cartes orbitent autour du centre */}
      <div className="relative mx-auto hidden min-h-[min(780px,92vh)] w-full max-w-[1280px] lg:block">
        <HeroOrbitDesktop />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="pointer-events-auto relative z-30 w-full max-w-lg px-6 py-8 text-center sm:max-w-xl sm:px-8">
            <HeroCopy />
          </div>
        </div>
      </div>

      {/* Mobile : texte puis cartes */}
      <div className="relative z-10 mx-auto max-w-xl text-center lg:hidden">
        <HeroCopy />
        <HeroOrbitMobile />
      </div>
    </section>
  );
}
