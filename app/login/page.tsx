"use client";

import Link from "next/link";
import { LandingPageShell } from "@/components/landing/LandingPageShell";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-landing-border bg-landing-bg/50 px-4 py-3 text-sm text-landing-fg outline-none transition placeholder:text-landing-muted/60 focus:border-landing-accent/50 focus:ring-2 focus:ring-landing-accent/20";

export default function LoginPage() {
  return (
    <LandingPageShell>
      <div className="rounded-2xl border border-landing-border bg-landing-card/80 p-8 shadow-[0_0_48px_-24px_rgba(255,107,44,0.35)] backdrop-blur-md sm:p-10">
        <h1 className="font-landing-serif text-3xl font-normal tracking-tight text-landing-fg sm:text-4xl">
          Connexion
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-landing-muted">
          Accède à ton espace ZenGrow (formulaire placeholder — connexion réelle à brancher plus tard).
        </p>

        <form
          className="mt-8 space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div>
            <label htmlFor="login-email" className="text-sm font-medium text-landing-fg">
              Email
            </label>
            <input id="login-email" name="email" type="email" autoComplete="email" className={fieldClass} placeholder="vous@restaurant.ch" />
          </div>
          <div>
            <label htmlFor="login-password" className="text-sm font-medium text-landing-fg">
              Mot de passe
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className={fieldClass}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-[#FF6B2C] py-3 text-sm font-semibold text-white shadow-[0_0_32px_-8px_rgba(255,107,44,0.75)] transition hover:brightness-110"
          >
            Se connecter
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-landing-muted">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="font-semibold text-landing-accent-soft underline decoration-landing-accent/30 underline-offset-4 hover:text-landing-accent">
            Créer un compte
          </Link>
        </p>
      </div>
    </LandingPageShell>
  );
}
