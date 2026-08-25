"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Container, PrimaryButton, SecondaryButton, Section } from "@/components/landing-v2/ui";

const ZenGrowHero = dynamic(() => import("@/components/ZenGrowHero").then((m) => m.ZenGrowHero), {
  ssr: false,
  loading: () => (
    <div
      className="flex min-h-[380px] items-center justify-center rounded-2xl border border-[rgba(59,158,255,0.2)] bg-[rgba(8,22,48,0.5)] text-sm text-[#8BA3C7]"
      aria-hidden
    >
      Chargement de la démo…
    </div>
  ),
});

export function HeroSection() {
  return (
    <Section id="hero" className="pt-10 md:pt-14">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 flex justify-center">
            <Image
              src="/zengrow-logo.png"
              alt="ZenGrow"
              width={220}
              height={64}
              className="h-10 w-auto sm:h-12"
              priority
            />
          </div>

          <h1 className="font-[family-name:var(--font-instrument-serif)] text-[clamp(2rem,5.5vw,3.25rem)] font-normal leading-[1.1] text-[#EEF6FF]">
            Remplissez votre restaurant grâce à l&apos;IA
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-[#8BA3C7] sm:text-base">
            ZenGrow crée votre page de réservation, relance vos anciens clients, génère vos campagnes
            marketing et vous aide à récolter plus d&apos;avis Google pour inspirer confiance et remplir vos
            tables plus souvent.
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <PrimaryButton href="/signup">Commencer maintenant</PrimaryButton>
            <SecondaryButton href="#ia">Voir une démo</SecondaryButton>
          </div>

          <p className="mt-6 text-xs tracking-wide text-[#8BA3C7] sm:text-sm">
            Réservations · Relances IA · Campagnes · Avis Google
          </p>
        </div>

        <div className="zghero-embed mt-10 md:mt-12">
          <ZenGrowHero />
        </div>
      </Container>
    </Section>
  );
}
