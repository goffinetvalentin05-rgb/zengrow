"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";

const automations = [
  "Relancer les anciens clients",
  "Générer vos campagnes",
  "Demander des avis Google",
  "Transformer les visites en réservations",
] as const;

const assistantOptions = [
  "Remplir un soir calme",
  "Faire revenir les anciens clients",
  "Demander des avis Google",
  "Promouvoir un menu spécial",
] as const;

export function Credibility() {
  return (
    <section className="relative overflow-x-hidden px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(255,122,61,0.1)] bg-[rgba(8,5,4,0.45)] px-5 py-8 backdrop-blur-xl sm:rounded-[1.75rem] sm:px-8 sm:py-9">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="font-landing-serif text-[clamp(1.35rem,3vw,1.85rem)] font-normal leading-snug text-[#FFF7EF]">
                L&apos;IA n&apos;est plus réservée aux grandes entreprises.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#AFA39A] sm:text-[15px]">
                De plus en plus d&apos;entreprises suisses utilisent l&apos;IA pour gagner du temps et
                automatiser leurs tâches. ZenGrow applique cette logique aux restaurants.
              </p>
            </div>

            <div className="relative mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="rounded-2xl border border-[rgba(255,122,61,0.15)] bg-[rgba(255,90,42,0.04)] p-5">
                <p className="text-sm font-medium text-[#FFF7EF]">Ce que ZenGrow automatise pour vous :</p>
                <ul className="mt-4 space-y-2.5">
                  {automations.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-[#AFA39A]">
                      <span className="size-1.5 shrink-0 rounded-full bg-[#FF7A3D]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <motion.div
                className="rounded-2xl border border-[rgba(255,122,61,0.2)] bg-[rgba(8,5,4,0.8)] p-5 shadow-[0_0_40px_-16px_rgba(255,90,42,0.35)]"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-[#FF7A3D]" />
                  <span className="text-xs font-medium text-[#F6A85A]">assistant IA ZenGrow</span>
                </div>
                <p className="mt-4 text-sm font-medium text-[#FFF7EF]">Que voulez-vous faire aujourd&apos;hui ?</p>
                <ul className="mt-3 space-y-2">
                  {assistantOptions.map((opt) => (
                    <li
                      key={opt}
                      className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.35)] px-3 py-2.5 text-xs text-[#AFA39A]"
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="mt-4 w-full rounded-full bg-[#FF5A2A] py-2.5 text-xs font-semibold text-white shadow-[0_0_24px_-6px_rgba(255,90,42,0.7)]"
                >
                  Générer avec l&apos;IA
                </button>
              </motion.div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
