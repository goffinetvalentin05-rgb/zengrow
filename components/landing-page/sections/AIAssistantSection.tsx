"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Container, GlassCard, GradientText, Section } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const ACTIONS = [
  "Relancer les clients venus il y a plus de 30 jours.",
  "Créer une campagne pour remplir mardi soir.",
  "Préparer un message pour annoncer le nouveau menu.",
  "Demander un avis aux clients venus cette semaine.",
  "Identifier les clients fidèles à remercier.",
] as const;

export function AIAssistantSection() {
  const reduce = useReducedMotion();

  return (
    <Section id="assistant-ia" className="relative overflow-hidden">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <h2 className="zg-lp-title zg-lp-display">
              Une IA qui vous aide vraiment, pas juste un <GradientText>gadget</GradientText>.
            </h2>
            <p className="zg-lp-lead">ZenGrow peut vous proposer des actions simples comme :</p>
            <ul className="mt-6 space-y-3">
              {ACTIONS.map((action) => (
                <li
                  key={action}
                  className="flex items-start gap-3 rounded-xl border border-[var(--zg-border-soft)] bg-white/[0.03] px-4 py-3 text-sm text-[var(--zg-muted)]"
                >
                  <Check className="mt-0.5 size-4 shrink-0 text-violet-400" />
                  <span>&ldquo;{action}&rdquo;</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm leading-relaxed text-[var(--zg-muted-soft)]">
              L&apos;objectif n&apos;est pas de remplacer votre façon de travailler. L&apos;objectif est de vous
              faire gagner du temps et de vous aider à mieux exploiter votre clientèle.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="relative">
            <div
              className="pointer-events-none absolute -inset-8 rounded-[2rem] opacity-70"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(139,92,246,0.3), transparent 70%)",
              }}
              aria-hidden
            />

            <GlassCard strong className="relative overflow-hidden p-6">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-5 text-violet-400" />
                  <span className="zg-lp-display text-sm font-bold">Actions suggérées</span>
                </div>
                <span className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-semibold text-violet-300">
                  5 nouvelles
                </span>
              </div>

              <div className="space-y-2.5">
                {!reduce
                  ? ACTIONS.map((action, i) => (
                      <motion.button
                        key={action}
                        type="button"
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--zg-border-soft)] bg-black/30 px-4 py-3.5 text-left text-sm text-[var(--zg-fg)] transition-colors hover:border-violet-500/35 hover:bg-violet-500/10"
                        initial={{ opacity: 0, x: 8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 + i * 0.07 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <span className="line-clamp-2">{action}</span>
                        <span className="shrink-0 rounded-md bg-violet-600/30 px-2 py-1 text-xs font-semibold text-violet-200">
                          Lancer
                        </span>
                      </motion.button>
                    ))
                  : ACTIONS.map((action) => (
                      <div
                        key={action}
                        className="flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--zg-border-soft)] bg-black/30 px-4 py-3.5 text-sm text-[var(--zg-fg)]"
                      >
                        <span>{action}</span>
                        <span className="shrink-0 rounded-md bg-violet-600/30 px-2 py-1 text-xs font-semibold text-violet-200">
                          Lancer
                        </span>
                      </div>
                    ))}
              </div>
            </GlassCard>

            {!reduce ? (
              <motion.div
                className="zg-lp-glass zg-lp-glass--float absolute -left-4 bottom-8 hidden w-40 p-3 lg:block"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <p className="text-[0.65rem] uppercase tracking-wide text-[var(--zg-muted)]">Clients fidèles</p>
                <p className="zg-lp-display text-xl font-bold">23</p>
              </motion.div>
            ) : null}
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
