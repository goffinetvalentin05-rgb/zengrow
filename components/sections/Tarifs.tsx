"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Reveal } from "@/components/sections/Reveal";
import { cn } from "@/src/lib/utils";

const plans = [
  {
    key: "starter",
    title: "Starter",
    subtitle: "Pour bien démarrer",
    amount: "49",
    unit: "CHF / mois",
    featured: false,
    features: [
      "Réservations en ligne",
      "Gestion des disponibilités",
      "Page de réservation personnalisable",
      "Demandes d'avis Google automatiques",
      "Feedback privé clients",
      "Base clients",
    ],
    cta: "Choisir Starter",
  },
  {
    key: "pro",
    title: "Pro",
    subtitle: "Pour accélérer",
    amount: "69",
    unit: "CHF / mois",
    featured: true,
    features: [
      "Tout le plan Starter",
      "Campagnes e-mail marketing",
      "Segmentation clients",
      "Stats clients",
      "Export clients",
    ],
    cta: "Choisir Pro",
  },
] as const;

export function Tarifs() {
  return (
    <section id="pricing" className="relative bg-landing-section py-24 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(255,107,44,0.1),transparent)]" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-landing-serif text-[clamp(2rem,4vw,3rem)] font-normal text-landing-fg">
            Des tarifs <em className="italic text-landing-accent">simples</em>, tout inclus
          </h2>
          <p className="mt-4 text-landing-muted">
            Deux formules alignées sur l&apos;app : Starter ou Pro. <strong className="font-medium text-landing-fg/90">14 jours d&apos;essai gratuit</strong> pour tout
            tester. Sans engagement long terme.
          </p>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-5xl gap-8 md:grid-cols-2">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "flex flex-col rounded-3xl p-8 backdrop-blur-sm sm:p-10",
                plan.featured ? "landing-surface landing-surface--featured relative" : "landing-surface",
              )}
            >
              {plan.featured ? (
                <span className="mb-2 inline-flex self-start rounded-full border border-landing-accent/35 bg-landing-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-landing-accent">
                  Recommandé
                </span>
              ) : null}
              <h3 className="font-landing-serif text-2xl font-normal text-landing-fg">{plan.title}</h3>
              <p className="mt-1 text-sm text-landing-muted">{plan.subtitle}</p>
              <div className="mt-6 flex items-end gap-2">
                <span className="font-landing-serif text-5xl tabular-nums text-landing-fg">{plan.amount}</span>
                <span className="pb-1 text-base font-medium text-landing-muted">{plan.unit}</span>
              </div>
              <ul className="mt-8 flex-1 space-y-3 text-sm text-landing-fg/90">
                {plan.features.map((line) => (
                  <li key={line} className="flex gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-landing-accent" strokeWidth={2.5} />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className={
                  plan.featured
                    ? "mt-8 flex min-h-12 w-full items-center justify-center rounded-xl bg-landing-accent text-sm font-semibold text-white shadow-[0_0_40px_-8px_rgba(255,107,44,0.75)] transition hover:brightness-110"
                    : "landing-btn-secondary mt-8 flex min-h-12 w-full items-center justify-center rounded-xl text-sm font-semibold"
                }
              >
                {plan.cta}
              </Link>
              <p className="mt-3 text-center text-xs text-landing-muted">Sans engagement long terme</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
