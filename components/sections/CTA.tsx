"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LandingDotGrid, LandingGlows } from "@/components/landing/landing-ui";
import { Reveal } from "@/components/sections/Reveal";

export function CTA() {
  return (
    <section
      id="cta"
      className="relative w-full overflow-hidden bg-[#050403] pb-20 pt-24 sm:pb-28 sm:pt-32"
    >
      <div id="pricing" className="absolute top-0 h-px w-px overflow-hidden opacity-0" aria-hidden />
      <LandingGlows />
      <LandingDotGrid />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#050403]/40 via-transparent to-[#050403]/80" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-12 text-center sm:px-6 sm:py-16">
        <Reveal className="flex w-full flex-col items-center">
          <h2 className="max-w-2xl font-landing-serif text-[clamp(1.85rem,4.5vw,3rem)] font-normal leading-tight text-[#FFF7EF]">
            Passez à la vitesse supérieure avec ZenGrow
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#AFA39A]">
            Une page restaurant, des réservations en ligne et une IA qui vous aide à faire revenir vos
            clients.
          </p>
          <div className="mt-10 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF5A2A] px-8 text-sm font-semibold text-white shadow-[0_0_48px_-10px_rgba(255,90,42,0.85)] transition hover:bg-[#FF7A3D] hover:brightness-110"
            >
              Commencer maintenant
            </Link>
            <Link href="/#ia" className="landing-btn-secondary inline-flex min-h-12 items-center justify-center rounded-full px-8 text-sm font-medium">
              Voir une démo
            </Link>
          </div>
        </Reveal>
      </div>

      <motion.div
        className="pointer-events-none absolute bottom-0 left-1/2 z-[5] w-max max-w-[100vw] -translate-x-1/2 translate-y-[42%] select-none whitespace-nowrap text-center font-landing-serif text-[clamp(3.5rem,18vw,11rem)] font-normal italic leading-none text-[#1B100B] sm:translate-y-[38%] sm:text-[clamp(4rem,15vw,12rem)]"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        aria-hidden
      >
        <span
          className="bg-gradient-to-b from-[rgba(255,90,42,0.22)] via-[rgba(120,60,30,0.12)] to-transparent bg-clip-text text-transparent"
          style={{ WebkitTextStroke: "1px rgba(255, 122, 61, 0.08)" }}
        >
          ZENGROW
        </span>
      </motion.div>
    </section>
  );
}
