"use client";

import { motion } from "framer-motion";
import { Eye, MessageCircleOff, StarOff } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";

const gaps = [
  {
    icon: Eye,
    label: "Visiteurs qui hésitent",
    detail: "Ils découvrent votre restaurant sans passer à la réservation.",
    offset: "lg:translate-y-0",
    span: "lg:col-span-5",
  },
  {
    icon: MessageCircleOff,
    label: "Anciens clients qui vous oublient",
    detail: "Des tables déjà connues ne se remplissent plus toutes seules.",
    offset: "lg:translate-y-10",
    span: "lg:col-span-4",
  },
  {
    icon: StarOff,
    label: "Avis Google jamais demandés",
    detail: "La confiance en ligne reste en retrait, même après une bonne visite.",
    offset: "lg:translate-y-4",
    span: "lg:col-span-3",
  },
] as const;

export function Problem() {
  return (
    <section id="probleme" className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(400px,70vw)] w-[min(600px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(43,140,255,0.08),transparent_65%)] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.65rem)] font-normal leading-tight text-[#EEF6FF]">
            Des clients vous découvrent… mais ne réservent pas toujours.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#8BA3C7]">
            Entre les visiteurs qui hésitent, les anciens clients qui vous oublient et les avis Google
            jamais demandés, votre restaurant laisse passer des opportunités chaque semaine.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mt-16 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
            {gaps.map((gap, i) => (
              <motion.div
                key={gap.label}
                className={`relative ${gap.span} ${gap.offset}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.55 }}
              >
                <div className="group relative h-full min-h-[180px] overflow-hidden rounded-[1.5rem] border border-[rgba(59,158,255,0.16)] bg-[rgba(6,16,36,0.55)] p-6 shadow-[0_32px_80px_-40px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl sm:p-7">
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(43,140,255,0.2),transparent_70%)] blur-2xl"
                    aria-hidden
                  />
                  <div className="relative flex size-11 items-center justify-center rounded-2xl border border-[rgba(59,158,255,0.22)] bg-[rgba(43,140,255,0.1)] text-[#5EB3FF] shadow-[0_0_28px_-8px_rgba(43,140,255,0.5)]">
                    <gap.icon className="size-5" strokeWidth={1.5} />
                  </div>
                  <p className="mt-5 font-landing-serif text-xl text-[#EEF6FF]">{gap.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#8BA3C7]">{gap.detail}</p>
                  <motion.div
                    className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-[rgba(43,140,255,0.5)] via-[rgba(56,212,255,0.2)] to-transparent"
                    animate={{ opacity: [0.35, 0.85, 0.35] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                    aria-hidden
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
