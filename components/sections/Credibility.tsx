"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
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
    <section id="ia" className="relative overflow-x-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div
        className="pointer-events-none absolute right-0 top-1/4 h-[min(400px,60vw)] w-[min(400px,50vw)] rounded-full bg-[radial-gradient(circle,rgba(255,90,42,0.12),transparent_70%)] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16 xl:gap-20">
        <Reveal>
          <div className="max-w-xl">
            <h2 className="font-landing-serif text-[clamp(1.75rem,3.5vw,2.35rem)] font-normal leading-snug text-[#FFF7EF]">
              L&apos;<span className="text-[#f06a32]">IA</span> n&apos;est plus réservée aux grandes entreprises.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#AFA39A]">
              De plus en plus d&apos;entreprises suisses utilisent l&apos;IA pour gagner du temps et
              automatiser leurs tâches. ZenGrow applique cette logique aux restaurants.
            </p>

            <ul className="mt-10 space-y-4">
              {automations.map((item, i) => (
                <motion.li
                  key={item}
                  className="flex items-start gap-3 text-[15px] text-[#D4C8BE]"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-[rgba(255,122,61,0.25)] bg-[rgba(255,90,42,0.08)]">
                    <Check className="size-3 text-[#FF7A3D]" strokeWidth={2.5} />
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto lg:max-w-none">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_50%_40%,rgba(255,90,42,0.18),transparent_65%)] blur-2xl"
              aria-hidden
            />

            <motion.div
              className="relative rounded-[1.75rem] border border-[rgba(255,122,61,0.22)] bg-[rgba(12,8,6,0.75)] p-6 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.85),0_0_60px_-20px_rgba(255,90,42,0.25)] backdrop-blur-2xl sm:p-7"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5A2A] to-[#C44A1A] shadow-[0_0_20px_-4px_rgba(255,90,42,0.8)]">
                  <Sparkles className="size-4 text-white" />
                </span>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#F6A85A]">
                    Assistant IA ZenGrow
                  </p>
                </div>
              </div>

              <p className="mt-6 font-landing-serif text-xl text-[#FFF7EF] sm:text-[1.35rem]">
                Que voulez-vous faire aujourd&apos;hui ?
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {assistantOptions.map((opt, i) => (
                  <motion.span
                    key={opt}
                    className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3.5 py-2 text-xs text-[#AFA39A] transition-colors hover:border-[rgba(255,122,61,0.25)] hover:text-[#FFF7EF]"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                  >
                    {opt}
                  </motion.span>
                ))}
              </div>

              <button
                type="button"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FF5A2A] py-3.5 text-sm font-semibold text-white shadow-[0_0_40px_-8px_rgba(255,90,42,0.85)] transition hover:bg-[#FF7A3D]"
              >
                <Sparkles className="size-4" />
                Générer avec l&apos;IA
              </button>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 hidden rounded-full border border-[rgba(255,122,61,0.2)] bg-[rgba(8,5,4,0.9)] px-3 py-1.5 text-[10px] text-[#F6A85A] backdrop-blur-md sm:block"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
              aria-hidden
            >
              Validation avant envoi
            </motion.div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
