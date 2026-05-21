"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";

export function IAExample() {
  return (
    <section id="ia" className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <span id="demo" className="sr-only" aria-hidden />

      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.75rem)] font-normal leading-tight text-[#FFF7EF]">
            42 clients n&apos;ont pas réservé depuis 60 jours.
          </h2>
          <p className="mt-4 text-base text-[#AFA39A]">
            ZenGrow les détecte, rédige une campagne de retour et vous laisse valider avant l&apos;envoi.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-8">
            <motion.div
              className="rounded-[1.75rem] border border-[rgba(255,122,61,0.22)] bg-[rgba(10,7,5,0.72)] p-6 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-8"
              whileHover={{ boxShadow: "0 0 56px -8px rgba(255, 90, 42, 0.3)" }}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-[#F6A85A]">
                Clients inactifs détectés
              </p>
              <p className="mt-4 font-landing-serif text-[clamp(2.5rem,8vw,4rem)] leading-none text-[#FFF7EF]">
                42 clients
              </p>
              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.35)] px-4 py-3">
                  <p className="text-[10px] uppercase text-[#AFA39A]">Dernière réservation</p>
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
              className="rounded-2xl border border-[rgba(255,122,61,0.18)] bg-[rgba(12,8,6,0.92)] p-5 backdrop-blur-xl lg:mt-8"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-xs font-medium uppercase tracking-wider text-[#F6A85A]">Campagne générée</p>
              <p className="mt-3 text-sm leading-relaxed text-[#AFA39A]">
                Bonjour, cela fait quelque temps que nous ne vous avons pas accueilli. Venez découvrir notre
                nouvelle carte cette semaine.
              </p>
              <div className="mt-4 flex gap-2">
                <button type="button" className="flex-1 rounded-lg border border-white/10 py-2 text-xs text-[#AFA39A]">
                  Modifier
                </button>
                <button
                  type="button"
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#FF5A2A] py-2 text-xs font-semibold text-white"
                >
                  <Send className="size-3.5" />
                  Envoyer
                </button>
              </div>
              <p className="mt-4 text-xs text-[#AFA39A]">L&apos;IA propose. Vous gardez toujours le contrôle.</p>
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
