"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ZenGrowHero } from "@/components/ZenGrowHero";
import { HeroAtmosphere, LandingLogo } from "@/components/landing/landing-ui";

function HeroCopy() {
  return (
    <>
      <motion.div
        className="mb-8 flex justify-center sm:mb-9"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <LandingLogo variant="hero" priority />
      </motion.div>

      <motion.h1
        className="font-landing-serif text-[clamp(2rem,5.5vw,3.35rem)] font-normal leading-[1.08] text-[#FFF7EF]"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        Remplissez votre restaurant grâce à l&apos;
        <span className="text-[#FF7A3D] [text-shadow:0_0_32px_rgba(255,90,42,0.45)]">IA</span>
      </motion.h1>

      <motion.p
        className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#AFA39A] sm:text-base"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.14 }}
      >
        ZenGrow crée votre page de réservation, relance les clients qui ne reviennent plus et génère vos
        campagnes marketing pour remplir vos tables plus souvent.
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
    </>
  );
}

export function Hero() {
  return (
    <section id="hero" className="relative w-full overflow-x-hidden px-4 sm:px-6">
      <HeroAtmosphere />
      <div className="relative z-10 mx-auto flex min-h-[min(58vh,580px)] max-w-xl flex-col items-center justify-center px-2 pb-10 pt-[calc(7rem+2.5rem)] text-center sm:max-w-xl sm:px-4 sm:pb-12 sm:pt-[calc(8.5rem+3.5rem)]">
        <HeroCopy />
      </div>
      <div
        className="pointer-events-none relative z-[2] -mt-6 h-24 w-full sm:-mt-10 sm:h-32"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(7, 5, 4, 0.35) 55%, rgba(7, 5, 4, 0.92) 100%)",
        }}
      />
      <div className="relative z-[2]">
        <ZenGrowHero />
      </div>
    </section>
  );
}
