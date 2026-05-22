import { Check } from "lucide-react";
import { Container, PrimaryButton, Section } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const INCLUDED = [
  "Réservations en ligne",
  "Page restaurant partageable",
  "Base clients",
  "Relances assistées par IA",
  "Campagnes marketing",
  "Automatisation des avis Google",
  "Tableau de bord restaurateur",
  "Support inclus",
] as const;

export function PricingSection() {
  return (
    <Section id="tarifs" className="relative">
      <Container>
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <h2 className="zg-lp-title zg-lp-display">
              Un outil pensé pour être rentable rapidement.
            </h2>
            <div className="mt-6 space-y-4 text-[var(--zg-muted)] leading-relaxed">
              <p>
                ZenGrow est conçu pour aider votre restaurant à générer plus de valeur que son coût.
              </p>
              <ul className="space-y-2 text-[var(--zg-fg)]">
                <li>Une table remplie en plus.</li>
                <li>Quelques clients qui reviennent.</li>
                <li>Plus d&apos;avis Google.</li>
                <li>Moins de temps perdu sur les messages et les relances.</li>
              </ul>
              <p className="font-medium text-[var(--zg-fg)]">
                Tout cela peut déjà faire une vraie différence.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="zg-lp-pricing-card relative p-7 sm:p-8">
              <div className="relative z-10">
                <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">
                  Plan ZenGrow
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="zg-lp-display text-5xl font-bold tracking-tight">CHF 69</span>
                  <span className="text-lg text-[var(--zg-muted)]">/ mois</span>
                </div>

                <p className="mt-6 text-sm font-semibold text-[var(--zg-fg)]">Inclus :</p>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-[var(--zg-muted)]">
                      <Check className="size-4 shrink-0 text-violet-400" />
                      {item}
                    </li>
                  ))}
                </ul>

                <PrimaryButton href="/signup" className="mt-8 w-full justify-center sm:w-auto" showArrow>
                  Commencer maintenant
                </PrimaryButton>

                <p className="mt-4 text-center text-xs text-[var(--zg-muted-soft)] sm:text-left">
                  Sans engagement. Pensé pour les restaurants qui veulent passer à l&apos;étape supérieure.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
