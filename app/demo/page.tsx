import Link from "next/link";
import { LandingPageShell } from "@/components/landing/LandingPageShell";

export default function DemoPage() {
  return (
    <LandingPageShell maxWidthClass="max-w-2xl">
      <div className="rounded-2xl border border-landing-border bg-landing-card/80 p-8 shadow-[0_0_48px_-24px_rgba(255,107,44,0.35)] backdrop-blur-md sm:p-10">
        <h1 className="font-landing-serif text-3xl font-normal tracking-tight text-landing-fg sm:text-4xl">
          Voir une démo
        </h1>
        <p className="mt-4 text-base leading-relaxed text-landing-muted">
          Découvre comment ZenGrow transforme une simple visite en réservation : page pro, parcours fluide, outils
          marketing et avis — le tout pensé pour les restaurants.
        </p>
        <p className="mt-4 text-sm text-landing-muted">
          Réserve un créneau avec l&apos;équipe pour une présentation personnalisée de la plateforme.
        </p>
        <Link
          href="mailto:contact@zengrow.ch?subject=Démo%20ZenGrow"
          className="mt-8 inline-flex w-full min-h-12 items-center justify-center rounded-full bg-[#FF6B2C] px-6 text-sm font-semibold text-white shadow-[0_0_32px_-8px_rgba(255,107,44,0.75)] transition hover:brightness-110 sm:w-auto"
        >
          Réserver une démo gratuite
        </Link>
        <p className="mt-8 text-center text-sm text-landing-muted">
          <Link href="/" className="text-landing-accent-soft underline decoration-landing-accent/30 underline-offset-4 hover:text-landing-accent">
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </div>
    </LandingPageShell>
  );
}
