"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Sparkles, Star, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";
import { cn } from "@/src/lib/utils";

const lanes: {
  from: string;
  to: string;
  iconFrom: LucideIcon;
  iconTo: LucideIcon;
}[] = [
  { from: "Visiteurs sans réservation", to: "Réservations", iconFrom: Users, iconTo: ArrowRight },
  { from: "Clients inactifs", to: "Relances", iconFrom: AlertCircle, iconTo: Sparkles },
  { from: "Avis Google oubliés", to: "Avis collectés", iconFrom: Star, iconTo: Star },
];

function LaneRow({
  lane,
  index,
}: {
  lane: (typeof lanes)[number];
  index: number;
}) {
  const IconFrom = lane.iconFrom;
  const IconTo = lane.iconTo;

  return (
    <motion.div
      className="relative grid grid-cols-1 items-center gap-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-3"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      {/* Input */}
      <div className="flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(0,0,0,0.35)] px-4 py-3.5 sm:justify-end sm:pr-5">
        <IconFrom className="size-4 shrink-0 text-[#AFA39A]" strokeWidth={1.5} />
        <span className="text-sm text-[#AFA39A]">{lane.from}</span>
      </div>

      {/* Connecteur + nœud IA */}
      <div className="relative flex items-center justify-center py-1 sm:w-[120px] sm:py-0">
        <div className="absolute hidden h-px w-full bg-gradient-to-r from-transparent via-[rgba(255,122,61,0.35)] to-transparent sm:block" aria-hidden />
        <motion.div
          className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgba(255,122,61,0.35)] bg-[rgba(255,90,42,0.12)] shadow-[0_0_20px_rgba(255,90,42,0.25)]"
          animate={{ boxShadow: ["0 0 16px rgba(255,90,42,0.2)", "0 0 28px rgba(255,90,42,0.38)", "0 0 16px rgba(255,90,42,0.2)"] }}
          transition={{ duration: 3 + index * 0.5, repeat: Infinity }}
        >
          <Sparkles className="size-3.5 text-[#FF7A3D]" />
        </motion.div>
        {/* Flèche mobile */}
        <ArrowRight className="mx-auto size-4 rotate-90 text-[rgba(255,122,61,0.4)] sm:hidden" aria-hidden />
      </div>

      {/* Output */}
      <div className="flex items-center gap-3 rounded-2xl border border-[rgba(255,122,61,0.22)] bg-[rgba(255,90,42,0.08)] px-4 py-3.5 shadow-[0_0_24px_-10px_rgba(255,90,42,0.3)] sm:pl-5">
        <IconTo className={cn("size-4 shrink-0 text-[#FF7A3D]", lane.to === "Avis collectés" && "fill-[#F6A85A]")} strokeWidth={1.5} />
        <span className="text-sm font-medium text-[#FFF7EF]">{lane.to}</span>
      </div>
    </motion.div>
  );
}

export function Problem() {
  return (
    <section id="probleme" className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.65rem)] font-normal leading-tight text-[#FFF7EF]">
            Votre restaurant reçoit des visites. Mais combien deviennent vraiment des réservations ?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#AFA39A]">
            Chaque opportunité perdue devient une action concrète — ZenGrow transforme l&apos;un en
            l&apos;autre.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative mt-14 overflow-hidden rounded-[1.75rem] border border-[rgba(255,122,61,0.12)] bg-[rgba(8,5,4,0.55)] p-5 shadow-[0_40px_100px_-48px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:p-8">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,90,42,0.08),transparent_55%)]"
              aria-hidden
            />

            <p className="relative z-10 mb-6 text-center text-xs font-medium text-[#AFA39A] sm:mb-8">
              Moteur IA ZenGrow · transformation 1-à-1
            </p>

            <div className="relative z-10 space-y-4 sm:space-y-5">
              {lanes.map((lane, i) => (
                <LaneRow key={lane.from} lane={lane} index={i} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
