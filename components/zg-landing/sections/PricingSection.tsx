import { Check } from "lucide-react";
import {
  BlockHeader,
  Container,
  PremiumCard,
  PrimaryButton,
  Section,
  SectionAmbient,
} from "../ui";
import { ScrollReveal } from "../ScrollReveal";

const INCLUDED = [
  "Réservations en ligne",
  "Page restaurant partageable",
  "Base clients",
  "Relances IA",
  "Campagnes marketing",
  "Avis Google automatisés",
  "Tableau de bord restaurateur",
  "Support inclus",
];

export function PricingSection() {
  return (
    <Section id="tarifs" className="relative overflow-hidden">
      <SectionAmbient />
      <Container>
        <ScrollReveal>
          <BlockHeader
            title="Un outil pensé pour être rentable rapidement."
            subtitle="Une table remplie en plus, quelques clients qui reviennent ou des avis Google plus réguliers peuvent déjà faire la différence."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="zg-pricing-shell mx-auto mt-14 max-w-2xl">
            <div className="zg-pricing-glow" aria-hidden />
            <div className="zg-pricing-card-inner">
              <PremiumCard className="overflow-hidden !border-0 !shadow-none">
                <div className="p-8 text-center md:p-10">
                  <p className="zg-display text-2xl font-bold text-white">ZenGrow</p>
                  <p className="zg-display mt-4 text-5xl font-bold text-white md:text-6xl">
                    CHF 69
                    <span className="text-xl font-medium text-[#9b8fb8]"> / mois</span>
                  </p>
                  <ul className="mx-auto mt-8 max-w-sm space-y-2.5 text-left text-sm text-white/90">
                    {INCLUDED.map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/30">
                          <Check className="h-3 w-3 text-violet-200" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <PrimaryButton href="/signup" className="w-full justify-center sm:w-auto">
                      Commencer maintenant
                    </PrimaryButton>
                  </div>
                </div>
              </PremiumCard>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
