"use client";

import { ZenGrowHero } from "@/components/zg-landing/ZenGrowHero";
import { Container, GhostButton, MegaTitle, PrimaryButton } from "../ui";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-14 md:pt-32 md:pb-20">
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <MegaTitle as="h1" className="zg-title-hero">
            Remplissez votre restaurant grâce à l&apos;IA.
          </MegaTitle>
          <p className="zg-hero-sub mx-auto mt-6 max-w-2xl">
            Réservations, relances clients, campagnes marketing et avis Google
            automatisés dans une seule plateforme pensée pour les restaurants.
          </p>
          <p className="mt-5 text-sm font-semibold tracking-[0.12em] text-violet-200/95 uppercase">
            Attirer · Réserver · Relancer · Fidéliser
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <PrimaryButton href="/signup">Essayer ZenGrow</PrimaryButton>
            <GhostButton href="#workflow">Voir comment ça marche</GhostButton>
          </div>
        </div>

        <div className="relative mx-auto mt-10 w-full max-w-6xl md:mt-14">
          <ZenGrowHero />
        </div>
      </Container>
    </section>
  );
}
