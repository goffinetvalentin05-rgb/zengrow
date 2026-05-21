"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { GlassCard, LandingGlows, SectionShell, SectionTitle } from "@/components/landing/landing-ui";
import { Reveal } from "@/components/sections/Reveal";

export function IAExample() {
  return (
    <SectionShell id="ia" className="bg-[#120B07]">
      <LandingGlows />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionTitle
          title="42 clients n'ont pas réservé depuis 60 jours."
          subtitle="ZenGrow les détecte, génère une campagne de retour et vous laisse l'envoyer en quelques clics."
        />

        <Reveal>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:gap-6">
            <GlassCard featured floatDelay={0.2} className="p-6 sm:p-8">
              <p className="text-xs font-medium uppercase tracking-wider text-[#F6A85A]">
                Clients inactifs détectés
              </p>
              <p className="mt-4 font-landing-serif text-[clamp(2.5rem,8vw,4rem)] leading-none text-[#FFF7EF]">
                42 clients
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.3)] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#AFA39A]">Dernière visite</p>
                  <p className="mt-1 text-sm font-medium text-[#FFF7EF]">+60 jours</p>
                </div>
                <div className="rounded-2xl border border-[rgba(255,122,61,0.18)] bg-[rgba(255,90,42,0.06)] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-wider text-[#AFA39A]">Potentiel</p>
                  <p className="mt-1 text-sm font-medium text-[#FF7A3D]">Réservations à récupérer</p>
                </div>
              </div>
              <Link
                href="/signup"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FF5A2A] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_40px_-8px_rgba(255,90,42,0.8)] transition hover:bg-[#FF7A3D] sm:w-auto"
              >
                <Sparkles className="size-4" />
                Générer une campagne IA
              </Link>
            </GlassCard>

            <GlassCard floatDelay={0.6} className="flex flex-col p-6 sm:p-7">
              <p className="text-xs font-medium uppercase tracking-wider text-[#F6A85A]">Campagne générée</p>
              <div className="mt-4 flex-1 rounded-2xl border border-[rgba(255,122,61,0.15)] bg-[rgba(0,0,0,0.35)] p-4">
                <p className="text-sm leading-relaxed text-[#AFA39A]">
                  Bonjour, cela fait quelque temps que nous ne vous avons pas accueilli. Venez découvrir
                  notre nouvelle carte cette semaine.
                </p>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-[#AFA39A]">
                <span className="font-medium text-[#FFF7EF]">Vous validez toujours avant l&apos;envoi.</span>{" "}
                ZenGrow propose, le restaurateur garde le contrôle.
              </p>
            </GlassCard>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
