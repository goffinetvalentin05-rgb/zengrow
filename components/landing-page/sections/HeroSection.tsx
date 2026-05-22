import { Container, PrimaryButton, SecondaryButton, Section } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";
import { HeroVisual } from "@/components/landing-page/sections/HeroVisual";

export function HeroSection() {
  return (
    <Section id="hero" className="pt-8 pb-12 md:pt-12 md:pb-16">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <ScrollReveal className="text-center lg:text-left">
            <h1 className="zg-lp-display text-[clamp(2rem,5.5vw,3.35rem)] font-bold leading-[1.08] tracking-tight text-[#EEF6FF]">
              Remplissez votre restaurant grâce à l&apos;IA
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#8BA3C7] sm:text-base lg:mx-0">
              ZenGrow crée votre page de réservation, relance vos anciens clients, génère vos
              campagnes marketing et vous aide à récolter plus d&apos;avis Google pour inspirer
              confiance et remplir vos tables plus souvent.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <PrimaryButton href="/signup">Commencer maintenant</PrimaryButton>
              <SecondaryButton href="#hero">Voir une démo</SecondaryButton>
            </div>
            <p className="mt-6 text-xs tracking-wide text-[#8BA3C7] sm:text-sm">
              Réservations · Relances IA · Campagnes · Avis Google
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.12}>
            <HeroVisual />
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
