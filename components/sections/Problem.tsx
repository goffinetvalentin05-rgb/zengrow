"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";

const lanes = [
  {
    from: "Un visiteur consulte votre restaurant",
    to: "ZenGrow le pousse à réserver",
  },
  {
    from: "Un ancien client ne revient plus",
    to: "ZenGrow prépare une relance IA",
  },
  {
    from: "Un client satisfait repart sans avis",
    to: "ZenGrow demande un avis Google",
  },
] as const;

function LaneRow({ from, to, index }: { from: string; to: string; index: number }) {
  return (
    <motion.div
      className="relative grid grid-cols-1 items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.25)] p-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-4 sm:p-5"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.45 }}
    >
      <p className="text-sm text-[#AFA39A] sm:text-right">{from}</p>
      <div className="flex items-center justify-center gap-2 sm:w-16">
        <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-[rgba(255,122,61,0.35)] to-[rgba(255,122,61,0.5)] sm:block" />
        <motion.div
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[rgba(255,122,61,0.35)] bg-[rgba(255,90,42,0.12)]"
          animate={{ boxShadow: ["0 0 12px rgba(255,90,42,0.15)", "0 0 24px rgba(255,90,42,0.35)", "0 0 12px rgba(255,90,42,0.15)"] }}
          transition={{ duration: 3 + index * 0.4, repeat: Infinity }}
        >
          <ArrowRight className="size-3.5 text-[#FF7A3D] sm:rotate-0 rotate-90" />
        </motion.div>
        <div className="hidden h-px flex-1 bg-gradient-to-r from-[rgba(255,122,61,0.5)] via-[rgba(255,122,61,0.35)] to-transparent sm:block" />
      </div>
      <p className="text-sm font-medium text-[#FFF7EF]">{to}</p>
    </motion.div>
  );
}

export function Problem() {
  return (
    <section id="probleme" className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.65rem)] font-normal leading-tight text-[#FFF7EF]">
            Vous perdez des réservations sans forcément le voir.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#AFA39A]">
            Un client visite votre page, hésite, repart… et ne revient jamais. ZenGrow transforme ces
            occasions perdues en actions simples.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative mt-14 overflow-hidden rounded-[1.75rem] border border-[rgba(255,122,61,0.12)] bg-[rgba(8,5,4,0.55)] p-5 backdrop-blur-2xl sm:p-8">
            <div className="space-y-3 sm:space-y-4">
              {lanes.map((lane, i) => (
                <LaneRow key={lane.from} from={lane.from} to={lane.to} index={i} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
