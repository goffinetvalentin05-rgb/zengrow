import { Check, X } from "lucide-react";
import { Container, Section } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const BEFORE = [
  "Les clients réservent puis disparaissent.",
  "Les avis Google sont demandés trop rarement.",
  "Les campagnes prennent du temps.",
  "Les périodes creuses sont subies.",
  "Le marketing est fait seulement quand vous avez le temps.",
] as const;

const AFTER = [
  "Chaque réservation enrichit votre base clients.",
  "L'IA vous aide à relancer les bonnes personnes.",
  "Les avis Google peuvent être automatisés.",
  "Les campagnes sont plus rapides à créer.",
  "Vos anciens clients deviennent de futures réservations.",
] as const;

export function ComparisonSection() {
  return (
    <Section id="comparatif" className="relative">
      <Container>
        <ScrollReveal>
          <h2 className="zg-lp-title zg-lp-display mx-auto max-w-2xl text-center">
            Avant ZenGrow / Avec ZenGrow
          </h2>
        </ScrollReveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 md:gap-6">
          <ScrollReveal>
            <div className="h-full rounded-2xl border border-[var(--zg-border-soft)] bg-white/[0.02] p-6 md:p-8">
              <h3 className="zg-lp-display text-lg font-bold text-[var(--zg-muted)]">Avant ZenGrow</h3>
              <ul className="mt-6 space-y-4">
                {BEFORE.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[var(--zg-muted)]">
                    <X className="mt-0.5 size-4 shrink-0 text-red-400/80" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <div className="zg-lp-col-with h-full p-6 md:p-8">
              <h3 className="zg-lp-display text-lg font-bold">
                <span className="zg-lp-gradient">Avec ZenGrow</span>
              </h3>
              <ul className="mt-6 space-y-4">
                {AFTER.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[var(--zg-fg)]">
                    <Check className="mt-0.5 size-4 shrink-0 text-violet-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
