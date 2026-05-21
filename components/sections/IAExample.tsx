"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";

export function IAExample() {
  return (
    <section id="ia" className="relative overflow-x-hidden px-4 py-20 sm:px-6 sm:py-28">
      <span id="demo" className="sr-only" aria-hidden />

      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-3xl text-center lg:text-left">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#F6A85A]">Exemple concret</p>
          <h2 className="mt-4 font-landing-serif text-[clamp(1.75rem,4vw,2.75rem)] font-normal leading-tight text-[#FFF7EF]">
            42 clients n&apos;ont pas réservé depuis 60 jours.
          </h2>
          <p className="mt-4 text-base text-[#AFA39A] lg:max-w-xl">
            ZenGrow les détecte, génère une campagne de retour et vous laisse l&apos;envoyer en quelques
            clics.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mt-14 min-h-[420px] lg:min-h-[460px]">
            <div
              className="pointer-events-none absolute left-1/2 top-1/2 h-[280px] w-[min(100%,480px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,90,42,0.14),transparent_68%)] blur-2xl"
              aria-hidden
            />

            <motion.div
              className="relative z-20 mx-auto w-full max-w-xl rounded-[1.75rem] border border-[rgba(255,122,61,0.22)] bg-[rgba(10,7,5,0.72)] p-6 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-8 lg:mx-0 lg:max-w-[58%]"
              whileHover={{ boxShadow: "0 0 56px -8px rgba(255, 90, 42, 0.3)" }}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-[#F6A85A]">
                Clients inactifs détectés
              </p>
              <p className="mt-4 font-landing-serif text-[clamp(2.5rem,8vw,4rem)] leading-none text-[#FFF7EF]">
                42 clients
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.35)] px-4 py-3">
                  <p className="text-[10px] uppercase text-[#AFA39A]">Dernière visite</p>
                  <p className="mt-1 text-sm font-medium text-[#FFF7EF]">+60 jours</p>
                </div>
                <div className="rounded-2xl border border-[rgba(255,122,61,0.18)] bg-[rgba(255,90,42,0.08)] px-4 py-3">
                  <p className="text-[10px] uppercase text-[#AFA39A]">Potentiel</p>
                  <p className="mt-1 text-sm font-medium text-[#FF7A3D]">Réservations à récupérer</p>
                </div>
              </div>
              <Link
                href="/signup"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#FF5A2A] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_40px_-8px_rgba(255,90,42,0.8)] transition hover:bg-[#FF7A3D]"
              >
                <Sparkles className="size-4" />
                Générer une campagne IA
              </Link>
            </motion.div>

            <motion.div
              className="relative z-40 mx-auto mt-6 w-full max-w-sm rounded-2xl border border-[rgba(255,122,61,0.18)] bg-[rgba(12,8,6,0.92)] p-5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.85)] backdrop-blur-xl lg:absolute lg:right-0 lg:top-[18%] lg:mt-0 lg:w-[42%]"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-[#F6A85A]">Campagne générée</p>
              <p className="mt-3 text-sm leading-relaxed text-[#AFA39A]">
                Bonjour, cela fait quelque temps que nous ne vous avons pas accueilli. Venez découvrir notre
                nouvelle carte cette semaine.
              </p>
              <p className="mt-4 flex items-start gap-2 text-xs text-[#AFA39A]">
                <Check className="mt-0.5 size-3.5 shrink-0 text-[#FF7A3D]" />
                <span>
                  <strong className="font-medium text-[#FFF7EF]">Vous validez toujours avant l&apos;envoi.</strong>{" "}
                  ZenGrow propose, le restaurateur garde le contrôle.
                </span>
              </p>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
