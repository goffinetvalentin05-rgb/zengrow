"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Brain, TrendingUp } from "lucide-react";
import { Container, GlassCard, Section, SectionHeader } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

export function AITrendSection() {
  const reduce = useReducedMotion();

  return (
    <Section id="ia">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <ScrollReveal>
            <SectionHeader
              align="left"
              title="Les entreprises passent à l'IA. Votre restaurant aussi peut prendre de l'avance."
              subtitle="ZenGrow rend l'IA simple et utile pour les restaurants : relancer les anciens clients, préparer des campagnes, récolter plus d'avis Google et transformer plus de visiteurs en réservations."
            />
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-[#8BA3C7] sm:text-base">
              Pas besoin d&apos;un outil compliqué. ZenGrow transforme l&apos;IA en actions concrètes
              pour remplir vos tables plus souvent.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <GlassCard strong className="relative overflow-hidden p-6 sm:p-8">
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-60"
                style={{
                  background: "radial-gradient(circle, rgba(27,79,255,0.4) 0%, transparent 70%)",
                }}
              />
              <div className="relative flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(27,79,255,0.22)] text-[#3b7bff]">
                  <Brain className="h-7 w-7" aria-hidden />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[#8BA3C7]">Tendance</p>
                  <p className="zg-lp-display text-xl font-semibold text-[#EEF6FF]">
                    IA orientée action
                  </p>
                </div>
              </div>

              <div className="relative mt-8 space-y-4">
                {[
                  { label: "Relances clients", pct: 78 },
                  { label: "Campagnes marketing", pct: 65 },
                  { label: "Avis Google", pct: 52 },
                ].map((bar, i) => (
                  <div key={bar.label}>
                    <div className="mb-1.5 flex justify-between text-xs text-[#8BA3C7]">
                      <span>{bar.label}</span>
                      <span className="tabular-nums text-[#3b7bff]">{bar.pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[rgba(27,79,255,0.12)]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#1b4fff] to-[#3b7bff]"
                        initial={{ width: reduce ? `${bar.pct}%` : "0%" }}
                        whileInView={{ width: `${bar.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative mt-6 flex items-center gap-2 text-sm text-[#8BA3C7]">
                <TrendingUp className="h-4 w-4 text-[#2f5cff]" aria-hidden />
                Simple à lancer, pensé pour les restaurants indépendants
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
