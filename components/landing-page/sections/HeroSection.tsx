import { Badge, Container, GradientText, PrimaryButton, SecondaryButton } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";
import { HeroVisual } from "@/components/landing-page/sections/HeroVisual";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20">
      <Container className="relative z-10 text-center">
        <ScrollReveal>
          <Badge>IA pour restaurants</Badge>
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <h1 className="zg-lp-hero-title zg-lp-display mx-auto mt-6 max-w-4xl">
            Remplissez votre restaurant grâce à{" "}
            <GradientText>l&apos;IA</GradientText>.
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="zg-lp-lead mx-auto mt-6 max-w-2xl">
            ZenGrow aide les restaurants à obtenir plus de réservations, faire revenir leurs anciens
            clients et récolter plus d&apos;avis Google grâce à une plateforme simple basée sur
            l&apos;intelligence artificielle.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <div className="zg-lp-pill-tags mx-auto mt-6 max-w-xl">
            <span>Réservations</span>
            <span>Relances IA</span>
            <span>Campagnes marketing</span>
            <span>Avis Google</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <PrimaryButton href="/signup" showArrow>
              Commencer maintenant
            </PrimaryButton>
            <SecondaryButton href="#fonctionnalites">Voir une démo</SecondaryButton>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.18}>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[var(--zg-muted-soft)]">
            Pensé pour les restaurateurs qui veulent gagner du temps, attirer plus de clients et
            remplir leurs tables plus régulièrement.
          </p>
        </ScrollReveal>

        <HeroVisual />
      </Container>
    </section>
  );
}
