"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Sparkles, Star, Users } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";
import { cn } from "@/src/lib/utils";

const lost = [
  { label: "Visiteurs sans réservation", icon: Users },
  { label: "Clients inactifs", icon: AlertCircle },
  { label: "Avis Google oubliés", icon: Star },
] as const;

const gained = [
  { label: "Réservations", icon: ArrowRight },
  { label: "Relances", icon: Sparkles },
  { label: "Avis collectés", icon: Star },
] as const;

function FlowPill({
  label,
  icon: Icon,
  variant,
  delay,
}: {
  label: string;
  icon: typeof Users;
  variant: "muted" | "accent";
  delay: number;
}) {
  const accent = variant === "accent";
  return (
    <motion.li
      className={
        accent
          ? "inline-flex items-center gap-2.5 rounded-full border border-[rgba(255,122,61,0.28)] bg-[rgba(255,90,42,0.1)] px-4 py-2.5 text-sm font-medium text-[#FFF7EF] shadow-[0_0_28px_-8px_rgba(255,90,42,0.35)]"
          : "inline-flex items-center gap-2.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.4)] px-4 py-2.5 text-sm text-[#AFA39A] backdrop-blur-md"
      }
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.45 }}
    >
      <Icon className={cn("size-4", accent ? "text-[#FF7A3D]" : "text-[#AFA39A]")} strokeWidth={1.5} />
      {label}
    </motion.li>
  );
}

export function Problem() {
  return (
    <section id="probleme" className="relative overflow-x-hidden px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.65rem)] font-normal leading-tight text-[#FFF7EF]">
            Votre restaurant reçoit des visites. Mais combien deviennent vraiment des réservations ?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#AFA39A]">
            ZenGrow transforme les opportunités perdues en actions mesurables pour votre établissement.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative mt-16 sm:mt-20">
            <svg
              className="pointer-events-none absolute left-0 right-0 top-1/2 hidden h-24 w-full -translate-y-1/2 text-[rgba(255,122,61,0.25)] md:block"
              viewBox="0 0 800 80"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M 20 40 Q 200 8 400 40 T 780 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="6 8"
              />
            </svg>

            <div className="flex flex-col items-center gap-12 md:flex-row md:items-center md:justify-between md:gap-6">
              <ul className="flex flex-col items-center gap-3 md:items-end">
                <p className="mb-1 text-xs font-medium text-[#AFA39A]">Opportunités perdues</p>
                {lost.map((item, i) => (
                  <FlowPill key={item.label} {...item} variant="muted" delay={i * 0.08} />
                ))}
              </ul>

              <motion.div
                className="relative flex shrink-0 flex-col items-center px-6"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  className="absolute size-32 rounded-full bg-[radial-gradient(circle,rgba(255,90,42,0.25),transparent_70%)] blur-2xl"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 5, repeat: Infinity }}
                  aria-hidden
                />
                <div className="relative flex size-20 items-center justify-center rounded-full border border-[rgba(255,122,61,0.4)] bg-[rgba(255,90,42,0.12)] shadow-[0_0_48px_rgba(255,90,42,0.3)] sm:size-24">
                  <Sparkles className="size-8 text-[#FF7A3D] sm:size-9" />
                </div>
                <p className="mt-4 text-center font-landing-serif text-lg text-[#FFF7EF]">Moteur IA</p>
                <p className="mt-1 text-center text-xs text-[#AFA39A]">ZenGrow</p>
              </motion.div>

              <ul className="flex flex-col items-center gap-3 md:items-start">
                <p className="mb-1 text-xs font-medium text-[#F6A85A]">Résultats</p>
                {gained.map((item, i) => (
                  <FlowPill key={item.label} {...item} variant="accent" delay={0.15 + i * 0.08} />
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
