import {
  Brain,
  Calendar,
  Mail,
  MessageSquare,
  Star,
  Users,
} from "lucide-react";
import { Container, GlassCard, IconBox, Section, SectionHeader } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const FEATURES = [
  {
    title: "Réservations en ligne",
    desc: "Recevez des demandes de réservation depuis une page claire, rapide et adaptée au mobile.",
    icon: Calendar,
  },
  {
    title: "Base clients",
    desc: "Chaque réservation enrichit votre base clients avec les informations importantes : nom, contact, historique et fréquence de visite.",
    icon: Users,
  },
  {
    title: "Relances IA",
    desc: "ZenGrow vous aide à savoir quels clients relancer et avec quel message.",
    icon: MessageSquare,
  },
  {
    title: "Campagnes marketing",
    desc: "Créez rapidement des campagnes pour annoncer un menu, remplir une soirée calme ou promouvoir un événement.",
    icon: Mail,
  },
  {
    title: "Avis Google automatisés",
    desc: "Envoyez automatiquement une demande d'avis après une visite confirmée.",
    icon: Star,
  },
  {
    title: "Suggestions intelligentes",
    desc: "L'IA peut proposer des actions concrètes : relancer les clients inactifs, remplir jeudi soir, demander des avis ou promouvoir une offre spéciale.",
    icon: Brain,
  },
] as const;

export function FeaturesSection() {
  return (
    <Section id="fonctionnalites" className="relative">
      <Container>
        <ScrollReveal>
          <SectionHeader
            title="Une plateforme simple pour faire grandir votre restaurant."
          />
        </ScrollReveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.04}>
              <GlassCard className="h-full p-6">
                <IconBox className="mb-4">
                  <item.icon className="size-5" />
                </IconBox>
                <h3 className="zg-lp-display text-base font-bold text-[var(--zg-fg)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--zg-muted)]">{item.desc}</p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
