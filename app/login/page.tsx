"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ZenGrowAuthCard, ZenGrowAuthPageShell } from "@/src/components/auth/zengrow-auth-page-shell";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";

const authFieldLabel = "mb-2 block text-xs font-medium uppercase tracking-wider text-landing-muted";

const authInputClassName =
  "min-h-[44px] w-full rounded-xl border border-landing-border bg-landing-bg px-4 py-3 text-sm text-landing-fg shadow-none placeholder:text-landing-muted/50 transition duration-200 focus:border-landing-accent focus:ring-2 focus:ring-landing-accent/20";

const authSubmitClassName =
  "h-12 w-full rounded-xl border-0 bg-landing-accent text-[15px] font-medium text-white shadow-[0_12px_36px_-14px_rgba(255,107,44,0.55)] transition hover:scale-[1.01] hover:bg-landing-accent/90 hover:shadow-[0_18px_44px_-12px_rgba(255,107,44,0.5)] focus-visible:ring-2 focus-visible:ring-landing-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-landing-bg active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60 disabled:hover:scale-100 disabled:hover:shadow-[0_12px_36px_-14px_rgba(255,107,44,0.55)]";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    const bootstrapResponse = await fetch("/api/bootstrap-restaurant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (!bootstrapResponse.ok) {
      const data = (await bootstrapResponse.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Impossible de préparer le restaurant.");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <ZenGrowAuthPageShell variant="dark" footerLine={null}>
      <ZenGrowAuthCard variant="dark">
        <div className="mb-8 flex flex-col items-center text-center">
          <p className="mb-2 font-landing-serif text-3xl italic text-landing-fg">ZenGrow</p>
          <span className="mb-6 inline-flex rounded-full border border-landing-accent/20 bg-landing-accent/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-landing-accent">
            Espace professionnel
          </span>
          <h1 className="mb-2 font-landing-serif text-3xl font-normal text-landing-fg">Connexion</h1>
          <p className="mb-8 text-sm text-landing-muted">Accède à ton dashboard ZenGrow.</p>
          <p className="mb-8 max-w-sm text-pretty text-xs text-landing-muted">
            Gère tes réservations, ta page web, ta base clients et tes campagnes depuis un seul espace.
          </p>
        </div>

        <form className="relative" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className={authFieldLabel}>
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vous@restaurant.ch"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className={authInputClassName}
            />
          </div>

          <div className="mt-5">
            <label htmlFor="password" className={authFieldLabel}>
              Mot de passe
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className={authInputClassName}
            />
            <div className="mt-2 flex justify-end">
              <Link href="/forgot-password" className="text-xs text-landing-accent transition hover:underline">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <Button type="submit" disabled={isLoading} size="lg" variant="ghost" className={authSubmitClassName}>
              {isLoading ? "Connexion en cours…" : "Se connecter"}
            </Button>
          </div>
        </form>

        <div className="mt-6 min-h-[1.25rem]" role="status" aria-live="polite" aria-atomic="true">
          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-950/50 px-3.5 py-3 text-sm leading-snug text-red-200/95">
              {error}
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-center text-sm text-landing-muted">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-landing-accent transition hover:underline">
            Créer mon restaurant
          </Link>
        </p>

        <p className="mt-8 text-center text-xs text-landing-muted/70">
          Réservations en ligne, page web, avis clients — tout ZenGrow, rien de superflu.
        </p>
      </ZenGrowAuthCard>
    </ZenGrowAuthPageShell>
  );
}
