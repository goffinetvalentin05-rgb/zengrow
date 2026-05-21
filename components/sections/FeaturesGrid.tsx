"use client";

import { Reveal } from "@/components/sections/Reveal";

const features = [
  {
    title: "Page restaurant mobile-first",
    body: "Une page rapide, élégante et pensée pour faire réserver.",
  },
  {
    title: "Réservations en ligne",
    body: "Vos clients réservent en quelques secondes depuis leur téléphone.",
  },
  {
    title: "Base clients automatique",
    body: "Chaque réservation enrichit votre fichier client.",
  },
  {
    title: "Relances IA",
    body: "Repérez les clients inactifs et faites-les revenir.",
  },
  {
    title: "Campagnes marketing",
    body: "Créez des messages prêts à envoyer en quelques clics.",
  },
  {
    title: "Avis Google automatisés",
    body: "Demandez plus d'avis aux bons clients, au bon moment.",
  },
] as const;

export function FeaturesGrid() {
  return (
    <section id="features" className="relative overflow-x-hidden px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <h2 className="font-landing-serif text-[clamp(1.85rem,4vw,2.5rem)] font-normal text-[#FFF7EF]">
            Tout est au même endroit.
          </h2>
          <p className="mt-4 text-sm text-[#AFA39A] sm:text-base">
            Plus besoin de jongler entre votre site, vos messages, vos réservations et vos avis.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.04}>
              <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(10,7,5,0.45)] px-4 py-4 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-[#FFF7EF]">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#AFA39A]">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
