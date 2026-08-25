import { Check } from "lucide-react";
import { Container, GhostButton, PrimaryButton, Section } from "../ui";
import { ScrollReveal } from "../ScrollReveal";

const TRUST = [
  "Essai gratuit 14 jours",
  "Aucune carte bancaire",
  "Configuration en quelques minutes",
];

export function FinalCTASection() {
  return (
    <Section id="cta" className="zg-zone-end !pb-16">
      <Container>
        <ScrollReveal>
          <div className="zg-cta-glass">
            <div className="zg-cta-glass__glow" aria-hidden />
            <div className="zg-cta-glass__inner">
              <div className="zg-cta-glass__copy">
                <h2 className="zg-cta-glass__title">
                  Vos clients doivent revenir.{" "}
                  <span className="text-sky-300">ZenGrow s&apos;en occupe.</span>
                </h2>
                <p className="zg-cta-glass__text">
                  Ajoutez vos clients une fois. ZenGrow les recontacte automatiquement au bon
                  moment pour planifier leur prochain rendez-vous.
                </p>
                <ul className="zg-cta-glass__trust">
                  {TRUST.map((item) => (
                    <li key={item}>
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="zg-cta-glass__actions">
                <PrimaryButton href="/pro/signup" className="w-full justify-center !min-h-12">
                  Essayer gratuitement
                </PrimaryButton>
                <GhostButton href="#workflow" className="w-full justify-center !min-h-11">
                  Voir la démo
                </GhostButton>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
