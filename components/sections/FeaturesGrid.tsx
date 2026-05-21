"use client";

import {
  Calendar,
  Globe,
  MessageSquare,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SectionShell, SectionTitle } from "@/components/landing/landing-ui";
import { Reveal } from "@/components/sections/Reveal";

const features: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "Page restaurant mobile-first",
    body: "Une page rapide et élégante, pensée pour faire réserver.",
    icon: Globe,
  },
  {
    title: "Réservations en ligne",
    body: "Vos clients réservent en quelques secondes depuis leur téléphone.",
    icon: Calendar,
  },
  {
    title: "Base clients automatique",
    body: "Chaque réservation enrichit votre fichier client.",
    icon: Users,
  },
  {
    title: "Relances IA",
    body: "Repérez les clients inactifs et relancez-les facilement.",
    icon: Sparkles,
  },
  {
    title: "Campagnes marketing",
    body: "Générez des messages prêts à envoyer en quelques clics.",
    icon: MessageSquare,
  },
  {
    title: "Avis Google automatisés",
    body: "Demandez plus d'avis aux bons clients, au bon moment.",
    icon: Star,
  },
];

export function FeaturesGrid() {
  return (
    <SectionShell id="features" className="bg-[#050403]">
      <div className="mx-auto max-w-6xl">
        <SectionTitle title="Tout ce qu'il faut, sans outil compliqué" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 0.05}>
                <div className="landing-surface group h-full rounded-2xl p-5 transition duration-300">
                  <div className="flex size-9 items-center justify-center rounded-xl border border-[rgba(255,122,61,0.18)] bg-[rgba(255,90,42,0.08)] text-[#FF7A3D] transition group-hover:shadow-[0_0_20px_rgba(255,90,42,0.15)]">
                    <Icon className="size-4" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-[#FFF7EF]">{f.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#AFA39A]">{f.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}
