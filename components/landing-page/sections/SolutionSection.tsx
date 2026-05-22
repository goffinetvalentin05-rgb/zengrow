"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalendarCheck, MessageCircle, Star } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const MOMENTS = [
  {
    id: "avant",
    label: "Avant la réservation",
    title: "Une page claire qui donne envie de réserver.",
    icon: CalendarCheck,
    phase: "Avant",
  },
  {
    id: "apres",
    label: "Après la visite",
    title: "Des avis Google demandés au bon moment.",
    icon: Star,
    phase: "Après",
  },
  {
    id: "plus-tard",
    label: "Quand le client ne revient plus",
    title: "Des relances IA pour le faire revenir.",
    icon: MessageCircle,
    phase: "Plus tard",
  },
] as const;

export function SolutionSection() {
  const reduce = useReducedMotion();

  return (
    <Section id="solution">
      <Container>
        <ScrollReveal>
          <SectionHeader title="ZenGrow agit sur les 3 moments qui comptent." />
        </ScrollReveal>

        <div className="relative mt-14">
          {/* Ligne timeline — décoratif, en flux avec padding */}
          <div
            className="hidden md:block absolute left-0 right-0 top-[3.25rem] h-px bg-gradient-to-r from-transparent via-[rgba(47,92,255,0.5)] to-transparent"
            aria-hidden
          />

          <ol className="grid gap-8 md:grid-cols-3 md:gap-6">
            {MOMENTS.map((m, i) => (
              <ScrollReveal key={m.id} delay={i * 0.1}>
                <li className="relative flex flex-col">
                  <motion.div
                    className="mb-4 flex items-center gap-3 md:flex-col md:items-start"
                    initial={{ opacity: 1 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <motion.span
                      className="zg-lp-glass zg-lp-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#3b7bff]"
                      animate={
                        reduce
                          ? undefined
                          : {
                              boxShadow: [
                                "0 0 0 0 rgba(27,79,255,0.4)",
                                "0 0 24px 4px rgba(27,79,255,0.35)",
                                "0 0 0 0 rgba(27,79,255,0.4)",
                              ],
                            }
                      }
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    >
                      {i + 1}
                    </motion.span>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3b7bff]">
                      {m.phase}
                    </span>
                  </motion.div>

                  <div className="zg-lp-glass flex flex-1 flex-col p-5 sm:p-6">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(27,79,255,0.18)] text-[#3b7bff]">
                      <m.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <p className="mt-3 text-xs font-medium text-[#8BA3C7]">{m.label}</p>
                    <p className="zg-lp-display mt-2 text-base font-semibold leading-snug text-[#EEF6FF]">
                      {m.title}
                    </p>
                  </div>
                </li>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
