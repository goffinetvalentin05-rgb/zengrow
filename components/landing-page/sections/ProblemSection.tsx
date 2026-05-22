"use client";

import { AlertCircle, MessageSquareOff, StarOff } from "lucide-react";
import { Container, GlassCard, Section, SectionHeader } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const ITEMS = [
  {
    icon: AlertCircle,
    title: "Visiteurs qui hésitent",
    text: "Ils découvrent votre restaurant mais ne réservent pas toujours.",
  },
  {
    icon: MessageSquareOff,
    title: "Anciens clients oubliés",
    text: "Sans relance, ils ne repensent plus à revenir.",
  },
  {
    icon: StarOff,
    title: "Avis jamais demandés",
    text: "Votre réputation en ligne ne reflète pas la qualité de votre service.",
  },
] as const;

export function ProblemSection() {
  return (
    <Section id="produit" className="zg-lp-dots opacity-40">
      <Container>
        <ScrollReveal>
          <SectionHeader
            title="Des clients vous découvrent… mais ne réservent pas toujours."
            subtitle="Entre les visiteurs qui hésitent, les anciens clients qui vous oublient et les avis Google jamais demandés, votre restaurant laisse passer des opportunités chaque semaine."
          />
        </ScrollReveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {ITEMS.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.08}>
              <GlassCard className="h-full p-5 sm:p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(27,79,255,0.18)] text-[#3b7bff]">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="zg-lp-display mt-4 text-base font-semibold text-[#EEF6FF]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#8BA3C7]">{item.text}</p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
