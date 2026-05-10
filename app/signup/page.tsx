"use client";

import Link from "next/link";
import { LandingPageShell } from "@/components/landing/LandingPageShell";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-landing-border bg-landing-bg/50 px-4 py-3 text-sm text-landing-fg outline-none transition placeholder:text-landing-muted/60 focus:border-landing-accent/50 focus:ring-2 focus:ring-landing-accent/20";

export default function SignupPage() {
  return (
    <LandingPageShell maxWidthClass="max-w-lg">
      <div className="rounded-2xl border border-landing-border bg-landing-card/80 p-8 shadow-[0_0_48px_-24px_rgba(255,107,44,0.35)] backdrop-blur-md sm:p-10">
        <h1 className="font-landing-serif text-3xl font-normal tracking-tight text-landing-fg sm:text-4xl">
          Créer un compte
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-landing-muted">
          Inscription ZenGrow (placeholder — aucune donnée n&apos;est enregistrée pour l&apos;instant).
        </p>

        <form
          className="mt-8 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div>
            <label htmlFor="signup-restaurant" className="text-sm font-medium text-landing-fg">
              Nom du restaurant
            </label>
            <input id="signup-restaurant" name="restaurant" type="text" className={fieldClass} placeholder="Le Bistrot du Lac" />
          </div>
          <div>
            <label htmlFor="signup-email" className="text-sm font-medium text-landing-fg">
              Email
            </label>
            <input id="signup-email" name="email" type="email" autoComplete="email" className={fieldClass} placeholder="vous@restaurant.ch" />
          </div>
          <div>
            <label htmlFor="signup-password" className="text-sm font-medium text-landing-fg">
              Mot de passe
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              className={fieldClass}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-[#FF6B2C] py-3 text-sm font-semibold text-white shadow-[0_0_32px_-8px_rgba(255,107,44,0.75)] transition hover:brightness-110"
          >
            Créer mon compte
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-landing-muted">
          Déjà inscrit ?{" "}
          <Link href="/login" className="font-semibold text-landing-accent-soft underline decoration-landing-accent/30 underline-offset-4 hover:text-landing-accent">
            Connexion
          </Link>
        </p>
      </div>
    </LandingPageShell>
  );
}
