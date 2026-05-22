import { Clock, MessageSquare, Repeat, Star, TrendingUp, Zap } from "lucide-react";
import { Container, GlassCard, IconBox, Section, SectionHeader } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const BENEFITS = [
  {
    title: "Plus de réservations",
    desc: "Vos clients peuvent réserver plus facilement et vous pouvez relancer ceux qui vous connaissent déjà.",
    icon: TrendingUp,
  },
  {
    title: "Plus de temps",
    desc: "ZenGrow vous aide à automatiser les tâches répétitives : demandes d'avis, relances, messages et campagnes.",
    icon: Clock,
  },
  {
    title: "Plus d'avis Google",
    desc: "Après une visite, ZenGrow peut envoyer automatiquement une demande d'avis pour améliorer votre réputation en ligne.",
    icon: Star,
  },
  {
    title: "Plus de clients qui reviennent",
    desc: "L'IA vous aide à identifier les clients à recontacter et à créer des messages adaptés pour les faire revenir.",
    icon: Repeat,
  },
  {
    title: "Moins de marketing improvisé",
    desc: "Vous n'avez plus besoin de repartir de zéro à chaque campagne. ZenGrow vous aide à trouver l'idée, écrire le message et lancer l'action.",
    icon: Zap,
  },
] as const;

export function BenefitsSection() {
  return (
    <Section id="benefices" className="relative">
      <Container>
        <ScrollReveal>
          <SectionHeader title="Ce que ZenGrow vous fait gagner" />
        </ScrollReveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((item, i) => (
            <ScrollReveal
              key={item.title}
              delay={i * 0.05}
              className={i === 4 ? "sm:col-span-2 lg:col-span-1" : undefined}
            >
              <GlassCard className="h-full p-6">
                <IconBox className="mb-4">
                  <item.icon className="size-5" />
                </IconBox>
                <h3 className="zg-lp-display text-base font-bold text-[var(--zg-fg)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--zg-muted)]">{item.desc}</p>
              </GlassCard>
            </ScrollReveal>
          ))}
          <ScrollReveal delay={0.25} className="sm:col-span-2 lg:col-span-1">
            <GlassCard strong className="flex h-full flex-col justify-center p-6">
              <MessageSquare className="mb-3 size-8 text-violet-400" />
              <p className="zg-lp-display text-lg font-bold leading-snug text-[var(--zg-fg)]">
                Une plateforme qui travaille pour vous, même quand le service est plein.
              </p>
            </GlassCard>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
