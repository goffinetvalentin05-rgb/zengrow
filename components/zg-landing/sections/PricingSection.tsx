import { Check } from "lucide-react";
import { Container, PrimaryButton, Section } from "../ui";
import { ScrollReveal } from "../ScrollReveal";

const LANDING_TRIAL_DAYS = 14;

const OUTCOMES = [
  "Ajoutez vos clients une fois",
  "Définissez la fréquence de retour",
  "Relances automatiques par SMS",
  "Le client choisit son créneau",
  "Rendez-vous confirmé dans votre agenda",
] as const;

export function PricingSection() {
  return (
    <Section id="tarifs" className="zg-zone-glass">
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="zg-title-section">Un client qui revient peut suffire.</h2>
            <p className="zg-section-sub mt-4">
              À 29 CHF/mois, ZenGrow se rentabilise dès qu&apos;un client revient grâce à une
              relance automatique.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="mx-auto mt-12 max-w-md">
            <div className="zg-pricing-scene">
              <div className="zg-pricing-halo zg-pricing-halo--violet" aria-hidden />
              <div className="zg-pricing-halo zg-pricing-halo--cyan" aria-hidden />
              <div className="zg-pricing-shell">
                <div className="zg-pricing-glow" aria-hidden />
                <div className="zg-pricing-card">
                  <div className="zg-pricing-card-border" aria-hidden />
                  <div className="zg-pricing-card-mesh" aria-hidden />
                  <div className="zg-pricing-card-shine" aria-hidden />
                  <div className="zg-pricing-card-body">
                    <p className="zg-pricing-tagline">
                      Automatisez le retour de vos clients récurrents.
                    </p>

                    <div className="zg-pricing-price-row">
                      <p className="zg-display zg-pricing-price">
                        29
                        <span className="zg-pricing-price-unit">CHF / mois</span>
                      </p>
                    </div>

                    <ul className="zg-pricing-outcomes">
                      {OUTCOMES.map((item) => (
                        <li key={item} className="zg-pricing-outcome">
                          <Check className="zg-pricing-outcome-icon" strokeWidth={2.5} aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <PrimaryButton href="/pro/signup" className="mt-8 w-full justify-center">
                      Essai gratuit {LANDING_TRIAL_DAYS} jours
                    </PrimaryButton>

                    <p className="zg-pricing-note">Sans carte bancaire</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
