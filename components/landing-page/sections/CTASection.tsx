import { Container, PrimaryButton, SecondaryButton, Section } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

export function CTASection() {
  return (
    <Section id="cta" className="pb-16 md:pb-20">
      <Container>
        <ScrollReveal>
          <div className="zg-lp-glass zg-lp-glass--strong relative overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-14">
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(27,79,255,0.25) 0%, transparent 65%)",
              }}
              aria-hidden
            />
            <div className="relative">
              <h2 className="zg-lp-display zg-lp-title text-[clamp(1.75rem,4vw,2.5rem)]">
                Faites revenir vos clients. Remplissez vos tables.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#8BA3C7] sm:text-base">
                Avec ZenGrow, votre restaurant dispose d&apos;une page de réservation, de relances IA,
                de campagnes marketing et d&apos;un système pour récolter plus d&apos;avis Google.
              </p>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
                <PrimaryButton href="/signup">Commencer maintenant</PrimaryButton>
                <SecondaryButton href="#hero">Voir une démo</SecondaryButton>
              </div>
              <p className="mt-6 text-xs text-[#8BA3C7] sm:text-sm">
                Simple à lancer. Pensé pour les restaurants. Propulsé par l&apos;IA.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
