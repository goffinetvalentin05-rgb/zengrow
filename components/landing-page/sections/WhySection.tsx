import { Check } from "lucide-react";
import { Container, GradientText, Section } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

const POINTS = [
  "recevoir des réservations,",
  "garder une trace de vos clients,",
  "faire revenir les anciens clients,",
  "créer des campagnes rapidement,",
  "récolter plus d'avis Google,",
  "remplir vos périodes plus calmes.",
] as const;

export function WhySection() {
  return (
    <Section id="pourquoi" className="relative">
      <Container>
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="zg-lp-title zg-lp-display">Pourquoi utiliser ZenGrow ?</h2>
            <p className="zg-lp-lead">
              Parce qu&apos;un restaurant ne doit pas seulement attendre que les clients reviennent.
            </p>
            <p className="mt-6 text-[var(--zg-muted)] leading-relaxed">
              Avec ZenGrow, vous construisez un vrai système pour :
            </p>
            <ul className="mt-8 grid gap-3 text-left sm:grid-cols-2">
              {POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-3 rounded-xl border border-[var(--zg-border-soft)] bg-white/[0.03] px-4 py-3.5 text-sm text-[var(--zg-fg)]"
                >
                  <Check className="size-4 shrink-0 text-violet-400" />
                  {point}
                </li>
              ))}
            </ul>
            <p className="zg-lp-display mt-10 text-xl font-bold md:text-2xl">
              ZenGrow transforme vos clients existants en{" "}
              <GradientText>nouvelles opportunités</GradientText>.
            </p>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
