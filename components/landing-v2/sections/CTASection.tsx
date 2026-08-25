import { Container, PrimaryButton, SecondaryButton, Section } from "@/components/landing-v2/ui";

export function CTASection() {
  return (
    <Section id="cta" className="pb-16">
      <Container>
        <div className="zg-card zg-card--glow mx-auto max-w-3xl px-6 py-10 text-center sm:px-10 sm:py-12">
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-[clamp(1.75rem,4vw,2.5rem)] font-normal leading-tight text-[#EEF6FF]">
            Faites revenir vos clients. Remplissez vos tables.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[#8BA3C7] sm:text-base">
            Avec ZenGrow, votre restaurant dispose d&apos;une page de réservation, de relances IA, de
            campagnes marketing et d&apos;un système pour récolter plus d&apos;avis Google.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
            <PrimaryButton href="/pro/signup">Commencer maintenant</PrimaryButton>
            <SecondaryButton href="#ia">Voir une démo</SecondaryButton>
          </div>
          <p className="mt-6 text-xs text-[#8BA3C7] sm:text-sm">
            Simple à lancer. Pensé pour les restaurants. Propulsé par l&apos;IA.
          </p>
        </div>
      </Container>
    </Section>
  );
}
