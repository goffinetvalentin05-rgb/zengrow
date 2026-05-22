import { AlertCircle, MessageSquareOff, StarOff, TrendingDown, Users } from "lucide-react";
import { Container, GlassCard, Section } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const PAIN_CARDS = [
  { title: "Clients non relancés", icon: Users, desc: "Ils repartent sans raison de revenir." },
  { title: "Avis Google oubliés", icon: StarOff, desc: "Peu de demandes après la visite." },
  { title: "Réservations perdues", icon: TrendingDown, desc: "Le parcours n'est pas assez clair." },
  { title: "Marketing fait trop rarement", icon: MessageSquareOff, desc: "Les campagnes restent en suspens." },
] as const;

export function DiscoverySection() {
  return (
    <Section id="decouverte" className="relative">
      <div
        className="zg-lp-orb zg-lp-orb--section pointer-events-none absolute right-0 top-0 opacity-40"
        style={{ background: "rgba(139, 92, 246, 0.2)" }}
        aria-hidden
      />
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <ScrollReveal>
            <h2 className="zg-lp-title zg-lp-display">
              Des clients vous découvrent… mais ne réservent pas toujours.
            </h2>
            <div className="mt-6 space-y-4 text-[var(--zg-muted)] leading-relaxed">
              <p>
                Aujourd&apos;hui, vos futurs clients vous trouvent sur Google, Instagram, TikTok ou via
                une publicité.
              </p>
              <p>
                Mais s&apos;ils ne comprennent pas rapidement où réserver, pourquoi venir chez vous ou ce
                qui vous rend attractif, ils passent au restaurant suivant.
              </p>
              <p>
                Et même quand un client vient chez vous, il repart souvent sans être relancé, sans
                laisser d&apos;avis et sans recevoir une vraie raison de revenir.
              </p>
              <p className="font-medium text-[var(--zg-fg)]">
                Résultat : vous perdez des réservations, des avis et des clients fidèles sans forcément
                vous en rendre compte.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-3 sm:grid-cols-2">
            {PAIN_CARDS.map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 0.06}>
                <GlassCard className="p-5">
                  <div className="zg-lp-icon-wrap mb-4">
                    <card.icon className="size-5" />
                  </div>
                  <h3 className="zg-lp-display text-base font-bold text-[var(--zg-fg)]">{card.title}</h3>
                  <p className="mt-2 text-sm text-[var(--zg-muted)]">{card.desc}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal className="mt-10 flex justify-center lg:mt-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-2 text-sm text-amber-200/90">
            <AlertCircle className="size-4 shrink-0" />
            Chaque visite non exploitée, c&apos;est une opportunité manquée.
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
