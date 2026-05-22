"use client";

import { Calendar, RefreshCw, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/sections/Reveal";

const moments = [
  {
    step: "01",
    title: "Avant la réservation",
    text: "Une page claire qui donne envie de réserver.",
    icon: Calendar,
    layout: "tall" as const,
  },
  {
    step: "02",
    title: "Après la visite",
    text: "Des avis Google demandés au bon moment.",
    icon: Star,
    layout: "wide" as const,
  },
  {
    step: "03",
    title: "Quand le client ne revient plus",
    text: "Des relances IA pour le faire revenir.",
    icon: RefreshCw,
    layout: "accent" as const,
  },
] as const;

export function Solution() {
  return (
    <section id="solution" className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.75rem)] font-normal text-[#EEF6FF]">
            ZenGrow agit sur les 3 moments qui comptent.
          </h2>
        </Reveal>

        <div className="relative mt-16 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
          {/* Moment 1 — carte haute */}
          <Reveal className="lg:col-span-4">
            <motion.div
              className="relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-[1.75rem] border border-[rgba(59,158,255,0.2)] bg-[rgba(6,16,36,0.55)] p-6 shadow-[0_32px_80px_-36px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl sm:p-7 lg:min-h-[360px]"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <div>
                <span className="text-xs font-medium tracking-widest text-[#5EB3FF]">{moments[0].step}</span>
                <div className="mt-4 flex size-11 items-center justify-center rounded-2xl border border-[rgba(59,158,255,0.22)] bg-[rgba(43,140,255,0.1)] text-[#5EB3FF]">
                  <Calendar className="size-5" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-landing-serif text-2xl text-[#EEF6FF]">{moments[0].title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#8BA3C7]">{moments[0].text}</p>
              </div>
              <div className="relative mx-auto mt-6 w-full max-w-[200px] overflow-hidden rounded-2xl border border-[rgba(59,158,255,0.25)] bg-[rgba(0,0,0,0.35)] p-3 shadow-[0_20px_50px_-20px_rgba(43,140,255,0.4)]">
                <div className="h-14 rounded-lg bg-gradient-to-br from-[rgba(43,140,255,0.35)] to-transparent" />
                <div className="mt-2 rounded-lg bg-[#2B8CFF] py-2 text-center text-[10px] font-semibold text-white shadow-[0_0_24px_-6px_rgba(43,140,255,0.8)]">
                  Réserver
                </div>
              </div>
            </motion.div>
          </Reveal>

          {/* Moments 2 & 3 — empilés */}
          <div className="flex flex-col gap-5 lg:col-span-8 lg:gap-6">
            <Reveal delay={0.06}>
              <motion.div
                className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(59,158,255,0.16)] bg-[rgba(6,16,36,0.5)] p-6 backdrop-blur-2xl sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-7"
                whileHover={{ borderColor: "rgba(94, 179, 255, 0.3)" }}
              >
                <div className="max-w-md">
                  <span className="text-xs font-medium tracking-widest text-[#5EB3FF]">{moments[1].step}</span>
                  <h3 className="mt-3 font-landing-serif text-2xl text-[#EEF6FF]">{moments[1].title}</h3>
                  <p className="mt-2 text-sm text-[#8BA3C7]">{moments[1].text}</p>
                </div>
                <div className="mt-5 flex shrink-0 items-center gap-2 sm:mt-0">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="size-5 fill-[#5EB3FF] text-[#5EB3FF]" />
                  ))}
                  <span className="ml-2 rounded-full border border-[rgba(56,212,255,0.3)] bg-[rgba(43,140,255,0.1)] px-2.5 py-1 text-[10px] text-[#5EB3FF]">
                    Google
                  </span>
                </div>
              </motion.div>
            </Reveal>

            <Reveal delay={0.12}>
              <motion.div
                className="relative overflow-hidden rounded-[1.75rem] border border-[rgba(43,140,255,0.32)] bg-[rgba(43,140,255,0.08)] p-6 shadow-[0_0_56px_-16px_rgba(43,140,255,0.4)] backdrop-blur-2xl sm:p-7"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="text-xs font-medium tracking-widest text-[#38D4FF]">{moments[2].step}</span>
                    <h3 className="mt-3 font-landing-serif text-2xl text-[#EEF6FF]">{moments[2].title}</h3>
                    <p className="mt-2 text-sm text-[#8BA3C7]">{moments[2].text}</p>
                  </div>
                  <div className="rounded-2xl border border-[rgba(59,158,255,0.22)] bg-[rgba(0,0,0,0.3)] px-5 py-4">
                    <p className="font-landing-serif text-xl text-[#5EB3FF]">Relance prête</p>
                    <p className="mt-1 text-xs text-[#8BA3C7]">À valider avant envoi</p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
