import { Container, GradientText, PrimaryButton, SecondaryButton } from "@/components/landing-page/ui";
import { ScrollReveal } from "@/components/landing-page/ScrollReveal";

export function CTASection() {
  return (
    <section className="relative z-10 py-20 md:py-28">
      <Container>
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl border border-[var(--zg-border)] bg-gradient-to-br from-violet-950/80 via-[#0a0614] to-black px-6 py-14 text-center sm:px-12 md:py-20">
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background:
                  "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(139,92,246,0.35), transparent 65%)",
              }}
              aria-hidden
            />
            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="zg-lp-title zg-lp-display">
                Vos prochains clients sont peut-être déjà venus chez vous.
              </h2>
              <p className="zg-lp-lead">
                ZenGrow vous aide à les faire revenir grâce à l&apos;IA, aux relances, aux campagnes
                marketing et aux avis Google automatisés.
              </p>
              <p className="zg-lp-display mt-4 text-lg font-bold text-[var(--zg-fg)]">
                Commencez à remplir vos tables plus{" "}
                <GradientText>intelligemment</GradientText>.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <PrimaryButton href="/pro/signup" showArrow>
                  Commencer maintenant
                </PrimaryButton>
                <SecondaryButton href="#fonctionnalites">Voir une démo</SecondaryButton>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Container>
    </section>
  );
}
