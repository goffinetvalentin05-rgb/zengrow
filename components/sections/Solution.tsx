"use client";

import { Calendar, Megaphone, Star } from "lucide-react";
import { GlassCard, SectionShell, SectionTitle } from "@/components/landing/landing-ui";
import { Reveal } from "@/components/sections/Reveal";

const cards = [
  {
    title: "Page de réservation",
    body: "Une page mobile-first avec vos photos, votre menu, vos horaires et un bouton de réservation clair.",
    icon: Calendar,
    mock: (
      <div className="mt-4 space-y-2 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.35)] p-3">
        <div className="h-16 rounded-xl bg-gradient-to-br from-[rgba(255,90,42,0.25)] to-transparent" />
        <div className="flex gap-2">
          <div className="h-2 flex-1 rounded-full bg-[rgba(255,255,255,0.08)]" />
          <div className="h-2 w-12 rounded-full bg-[rgba(255,255,255,0.08)]" />
        </div>
        <div className="rounded-xl bg-[#FF5A2A] py-2 text-center text-[10px] font-semibold text-white">
          Réserver une table
        </div>
      </div>
    ),
  },
  {
    title: "Campagnes IA",
    body: "ZenGrow génère vos relances, offres spéciales et campagnes marketing en quelques secondes.",
    icon: Megaphone,
    featured: true,
    mock: (
      <div className="mt-4 rounded-2xl border border-[rgba(255,122,61,0.2)] bg-[rgba(255,90,42,0.08)] p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[#F6A85A]">Message généré</p>
        <p className="mt-2 text-xs leading-relaxed text-[#AFA39A]">
          Bonjour, cela fait un moment… Venez découvrir notre carte de saison.
        </p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-lg border border-[rgba(255,255,255,0.1)] px-2 py-1 text-[10px] text-[#AFA39A]">
            Modifier
          </span>
          <span className="rounded-lg bg-[#FF5A2A]/90 px-2 py-1 text-[10px] font-medium text-white">
            Valider
          </span>
        </div>
      </div>
    ),
  },
  {
    title: "Avis Google",
    body: "Après une visite, ZenGrow aide à transformer les clients satisfaits en avis visibles.",
    icon: Star,
    mock: (
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.35)] p-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-[rgba(255,90,42,0.15)] text-[#FF7A3D]">
          <Star className="size-4 fill-current" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#FFF7EF]">Client satisfait</p>
          <p className="text-[10px] text-[#AFA39A]">Demande d&apos;avis envoyée après validation</p>
        </div>
      </div>
    ),
  },
];

export function Solution() {
  return (
    <SectionShell className="bg-[#050403]">
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionTitle title="Une page qui réserve. Une IA qui relance." />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={i * 0.08}>
                <GlassCard featured={card.featured} floatDelay={i * 0.3} className="h-full p-5 sm:p-6">
                  <div className="flex size-10 items-center justify-center rounded-xl border border-[rgba(255,122,61,0.2)] bg-[rgba(255,90,42,0.1)] text-[#FF7A3D]">
                    <Icon className="size-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-4 font-landing-serif text-xl text-[#FFF7EF]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#AFA39A]">{card.body}</p>
                  {card.mock}
                </GlassCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
