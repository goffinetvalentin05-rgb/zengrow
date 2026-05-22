"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bot, Sparkles, Wand2, Zap } from "lucide-react";
import { Container, GlassCard, GradientText, Section } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const BUBBLES = [
  "Créer une campagne pour mardi soir",
  "Relancer les clients inactifs",
  "Préparer un message menu",
] as const;

export function AITrendSection() {
  const reduce = useReducedMotion();

  return (
    <Section id="ia-tendance" className="relative overflow-hidden">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <h2 className="zg-lp-title zg-lp-display">
              Les entreprises passent à l&apos;IA. Votre restaurant aussi peut prendre de{" "}
              <GradientText>l&apos;avance</GradientText>.
            </h2>
            <div className="mt-6 space-y-4 text-[var(--zg-muted)] leading-relaxed">
              <p>L&apos;IA n&apos;est pas réservée aux grandes entreprises.</p>
              <p>
                Avec ZenGrow, elle devient un assistant simple pour votre restaurant : elle vous aide
                à créer des messages, relancer vos clients, préparer des campagnes et automatiser
                certaines actions qui prennent normalement du temps.
              </p>
              <p className="font-medium text-[var(--zg-fg)]">
                Vous ne devez pas apprendre à utiliser un outil compliqué. ZenGrow vous propose
                directement des actions utiles pour votre restaurant.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="relative">
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-60"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(139,92,246,0.25), transparent 65%)",
              }}
              aria-hidden
            />

            <GlassCard strong className="relative p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30">
                  <Bot className="size-5 text-white" />
                </div>
                <div>
                  <p className="zg-lp-display text-sm font-bold">Assistant ZenGrow</p>
                  <p className="text-xs text-[var(--zg-muted)]">En ligne · prêt à agir</p>
                </div>
                <Sparkles className="ml-auto size-4 text-violet-400" />
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-[var(--zg-border-soft)] bg-black/25 px-4 py-3 text-sm text-[var(--zg-muted)]">
                  Bonjour ! Voici 3 actions utiles pour votre restaurant cette semaine :
                </div>
                {!reduce
                  ? BUBBLES.map((text, i) => (
                      <motion.div
                        key={text}
                        initial={{ opacity: 0, x: 12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.45 }}
                        className="flex items-start gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3"
                      >
                        <Wand2 className="mt-0.5 size-4 shrink-0 text-violet-400" />
                        <p className="text-sm text-[var(--zg-fg)]">{text}</p>
                      </motion.div>
                    ))
                  : BUBBLES.map((text) => (
                      <div
                        key={text}
                        className="flex items-start gap-2 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3"
                      >
                        <Wand2 className="mt-0.5 size-4 shrink-0 text-violet-400" />
                        <p className="text-sm text-[var(--zg-fg)]">{text}</p>
                      </div>
                    ))}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-[var(--zg-border-soft)] bg-white/5 px-3 py-2.5">
                <Zap className="size-4 text-violet-400" />
                <span className="text-xs text-[var(--zg-muted)]">Tapez une action ou choisissez une suggestion…</span>
              </div>
            </GlassCard>

            <GlassCard
              float
              className="absolute -right-2 -top-4 hidden w-44 p-3 md:block lg:-right-6"
            >
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--zg-muted)]">
                Gain de temps
              </p>
              <p className="zg-lp-display text-lg font-bold">-4h / sem.</p>
            </GlassCard>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
