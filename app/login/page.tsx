"use client";

import { FormEvent, useState } from "react";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ZenGrowAuthCard, ZenGrowAuthPageShell } from "@/src/components/auth/zengrow-auth-page-shell";
import { createClient } from "@/src/lib/supabase/client";
import {
  authErrorClassName,
  authFieldLabel,
  authInputClassName,
  authLinkClassName,
  authSubmitClassName,
  authBadgeClassName,
} from "@/src/lib/auth/auth-form-styles";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";

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
          <p className="mb-2 font-[family-name:var(--font-zg-display)] text-3xl font-bold tracking-tight text-landing-fg">
            ZenGrow
          </p>
          <span className={cn("mb-6", authBadgeClassName)}>
            Espace professionnel
          </span>
          <h1 className="mb-2 font-[family-name:var(--font-zg-display)] text-3xl font-bold tracking-tight text-landing-fg">
            Connexion
          </h1>
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
              <Link href="/forgot-password" className={cn("text-xs", authLinkClassName)}>
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
            <p className={authErrorClassName}>
              {error}
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-center text-sm text-landing-muted">
          Pas encore de compte ?{" "}
          <Link href="/signup" className={authLinkClassName}>
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
