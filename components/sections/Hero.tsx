"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarCheck, Megaphone, Sparkles, Star, Users } from "lucide-react";
import {
  GlassCard,
  LandingBadge,
  LandingDotGrid,
  LandingGlows,
  StatusBadge,
} from "@/components/landing/landing-ui";
import { Reveal } from "@/components/sections/Reveal";

const floatCards = [
  {
    title: "42 clients absents depuis 60 jours",
    body: "ZenGrow a identifié vos clients inactifs.",
    cta: "Créer une campagne IA",
    icon: Users,
    delay: 0,
    className: "lg:col-span-1",
  },
  {
    title: "Nouvelle réservation",
    body: "Samedi · 20:00 · 4 personnes",
    badge: "Confirmée",
    badgeVariant: "success" as const,
    icon: CalendarCheck,
    delay: 0.4,
    className: "lg:col-span-1",
    featured: true,
  },
  {
    title: "Campagne prête à envoyer",
    body: "Revenez découvrir notre nouvelle carte cette semaine.",
    badge: "Générée par l'IA",
    icon: Megaphone,
    delay: 0.8,
    className: "lg:col-span-1",
  },
  {
    title: "Avis Google automatisé",
    body: "12 clients satisfaits à relancer",
    badge: "Prêt",
    icon: Star,
    delay: 1.2,
    className: "lg:col-span-1",
  },
];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full overflow-x-hidden bg-[#050403] pb-16 pt-28 sm:pb-24 sm:pt-36"
    >
      <LandingGlows />
      <LandingDotGrid />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-4 text-center sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <LandingBadge>Page restaurant + IA</LandingBadge>
        </motion.div>

        <motion.h1
          className="mt-6 max-w-[18ch] font-landing-serif text-[clamp(2rem,6.5vw,3.5rem)] font-normal leading-[1.08] text-[#FFF7EF] sm:max-w-none"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          L&apos;<em className="not-italic text-[#FF7A3D]">IA</em> qui transforme vos visiteurs en{" "}
          <em className="italic text-[#FF7A3D]">réservations</em>
        </motion.h1>

        <motion.p
          className="mt-5 max-w-2xl text-sm leading-relaxed text-[#AFA39A] sm:text-base"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16 }}
        >
          ZenGrow crée une page restaurant pensée pour faire réserver, puis utilise l&apos;IA pour
          relancer vos clients, générer vos campagnes et récolter plus d&apos;avis Google.
        </motion.p>

        <motion.div
          className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.24 }}
        >
          <Link
            href="/signup"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#FF5A2A] px-8 text-sm font-semibold text-white shadow-[0_0_48px_-8px_rgba(255,90,42,0.85)] transition hover:bg-[#FF7A3D] hover:shadow-[0_0_56px_-6px_rgba(255,122,61,0.9)]"
          >
            Commencer maintenant
          </Link>
          <Link
            href="/#ia"
            className="landing-btn-secondary inline-flex min-h-12 items-center justify-center rounded-full px-8 text-sm font-medium"
          >
            Voir une démo
          </Link>
        </motion.div>

        <motion.p
          className="mt-5 text-xs text-[#AFA39A]/90 sm:text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.32 }}
        >
          Sans site compliqué. Sans outils dispersés. Tout au même endroit.
        </motion.p>
      </div>

      <Reveal className="relative z-10 mx-auto mt-14 w-full max-w-6xl px-4 sm:mt-20 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {floatCards.map((card) => {
            const Icon = card.icon;
            return (
              <GlassCard
                key={card.title}
                featured={card.featured}
                floatDelay={card.delay}
                className={card.className}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[rgba(255,122,61,0.2)] bg-[rgba(255,90,42,0.1)] text-[#FF7A3D]">
                    <Icon className="size-4" strokeWidth={1.5} />
                  </div>
                  {card.badge ? (
                    <StatusBadge variant={card.badgeVariant}>{card.badge}</StatusBadge>
                  ) : null}
                </div>
                <p className="mt-3 text-sm font-semibold leading-snug text-[#FFF7EF]">{card.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#AFA39A]">{card.body}</p>
                {card.cta ? (
                  <button
                    type="button"
                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[rgba(255,90,42,0.12)] px-3 py-2 text-xs font-medium text-[#FF7A3D] transition hover:bg-[rgba(255,90,42,0.2)]"
                  >
                    <Sparkles className="size-3.5" />
                    {card.cta}
                  </button>
                ) : null}
              </GlassCard>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
