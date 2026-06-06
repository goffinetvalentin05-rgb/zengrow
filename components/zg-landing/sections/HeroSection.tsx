"use client";

import { ZenGrowHero } from "@/components/zg-landing/ZenGrowHero";
import { Container, GhostButton, MegaTitle, PrimaryButton } from "../ui";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="flex min-h-screen flex-col justify-center pt-24 md:pt-28">
        <Container>
          <div className="mx-auto max-w-4xl text-center">
            <MegaTitle as="h1" className="zg-title-hero">
              L&apos;IA qui fait revenir vos clients.
            </MegaTitle>
            <p className="zg-hero-sub mx-auto mt-6 max-w-2xl">
              Ajoutez simplement le numéro de vos clients. ZenGrow les relance automatiquement au bon
              moment pour récupérer du chiffre d&apos;affaires que vous auriez pu perdre.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <PrimaryButton href="/signup" className="!min-h-14 !px-8 !text-base sm:!text-lg">
                Essai gratuit 7 jours
              </PrimaryButton>
              <GhostButton href="#workflow" className="!min-h-14 !px-8 !text-base sm:!text-lg">
                Voir comment ça fonctionne
              </GhostButton>
            </div>
          </div>
        </Container>
      </div>

      <Container className="pb-14 md:pb-20">
        <div className="relative mx-auto mt-10 w-full max-w-6xl md:mt-14">
          <ZenGrowHero />
        </div>
      </Container>
    </section>
  );
}
