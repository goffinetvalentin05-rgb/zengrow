"use client";

import { ZenGrowHero } from "@/components/zg-landing/ZenGrowHero";
import { Container, MegaTitle, PrimaryButton } from "../ui";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="flex min-h-screen flex-col justify-center pt-24 md:pt-28">
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
            <div className="mt-9 flex justify-center">
              <PrimaryButton href="/signup" className="!min-h-14 !px-8 !text-base sm:!text-lg">
                Essayer ZenGrow
              </PrimaryButton>
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
