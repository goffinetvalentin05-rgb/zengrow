"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";

const useCases = [
  "Remplir un soir calme",
  "Faire revenir les anciens clients",
  "Promouvoir un menu spécial",
  "Demander plus d'avis Google",
] as const;

export function AIConcrete() {
  return (
    <section id="ia" className="relative overflow-x-hidden px-4 py-20 sm:px-6 sm:py-28">
      <div
        className="pointer-events-none absolute right-0 top-1/4 h-[min(420px,62vw)] w-[min(420px,52vw)] rounded-full bg-[radial-gradient(circle,rgba(43,140,255,0.14),transparent_70%)] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16 xl:gap-20">
        <Reveal>
          <div className="max-w-xl">
            <h2 className="font-landing-serif text-[clamp(1.75rem,3.5vw,2.35rem)] font-normal leading-snug text-[#EEF6FF]">
              L&apos;IA travaille là où vous manquez de temps.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#8BA3C7]">
              Elle prépare vos relances, vos campagnes et vos textes marketing. Vous gardez la main, vous
              validez, puis vous envoyez.
            </p>
            <p className="mt-8 flex items-start gap-3 rounded-2xl border border-[rgba(59,158,255,0.2)] bg-[rgba(43,140,255,0.06)] px-4 py-3.5 text-sm font-medium text-[#EEF6FF]">
              <Check className="mt-0.5 size-4 shrink-0 text-[#38D4FF]" strokeWidth={2.5} />
              L&apos;IA propose. Vous gardez toujours le contrôle.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto lg:max-w-none">
            <div
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_50%_40%,rgba(43,140,255,0.2),transparent_65%)] blur-2xl"
              aria-hidden
            />

            <motion.div
              className="relative rounded-[1.75rem] border border-[rgba(59,158,255,0.24)] bg-[rgba(6,16,36,0.72)] p-6 shadow-[0_32px_80px_-24px_rgba(0,0,0,0.85),0_0_60px_-20px_rgba(43,140,255,0.3)] backdrop-blur-2xl sm:p-7"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2B8CFF] to-[#0D4A9E] shadow-[0_0_20px_-4px_rgba(43,140,255,0.85)]">
                  <Sparkles className="size-4 text-white" />
                </span>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#5EB3FF]">
                  Assistant IA ZenGrow
                </p>
              </div>

              <p className="mt-6 font-landing-serif text-xl text-[#EEF6FF] sm:text-[1.35rem]">
                Que voulez-vous faire aujourd&apos;hui ?
              </p>

              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {useCases.map((opt, i) => (
                  <motion.span
                    key={opt}
                    className={`rounded-xl border px-3.5 py-2.5 text-xs transition-colors ${
                      i === 0
                        ? "border-[rgba(43,140,255,0.45)] bg-[rgba(43,140,255,0.12)] text-[#EEF6FF] shadow-[0_0_24px_-8px_rgba(43,140,255,0.5)]"
                        : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[#8BA3C7]"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.12 + i * 0.05 }}
                  >
                    {opt}
                  </motion.span>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.25)] p-3">
                <p className="text-[11px] uppercase tracking-wider text-[#8BA3C7]">Brouillon IA</p>
                <p className="mt-2 text-sm leading-relaxed text-[#EEF6FF]/90">
                  Bonjour Marie, nous serions ravis de vous accueillir à nouveau ce vendredi…
                </p>
              </div>

              <button
                type="button"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(59,158,255,0.35)] bg-[rgba(43,140,255,0.15)] py-3.5 text-sm font-semibold text-[#EEF6FF] transition hover:bg-[rgba(43,140,255,0.22)]"
              >
                <Sparkles className="size-4 text-[#5EB3FF]" />
                Valider avant envoi
              </button>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 hidden rounded-full border border-[rgba(59,158,255,0.22)] bg-[rgba(4,12,28,0.92)] px-3 py-1.5 text-[10px] text-[#5EB3FF] backdrop-blur-md sm:block"
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
