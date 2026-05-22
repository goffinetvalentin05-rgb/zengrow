"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ZenGrowAuthCard, ZenGrowAuthPageShell } from "@/src/components/auth/zengrow-auth-page-shell";
import { createClient } from "@/src/lib/supabase/client";
import { slugifyRestaurantName } from "@/src/lib/utils";
import {
  authBadgeClassName,
  authErrorClassName,
  authFieldLabel,
  authInputClassName,
  authLinkClassName,
  authSubmitClassName,
} from "@/src/lib/auth/auth-form-styles";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsLoading(true);

    const slug = slugifyRestaurantName(restaurantName);

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          restaurant_name: restaurantName,
          restaurant_slug: slug,
        },
      },
    });

    if (signupError) {
      setError(signupError.message);
      setIsLoading(false);
      return;
    }

    if (!signupData.session) {
      setInfo("Compte créé. Confirmez votre e-mail puis connectez-vous pour accéder à votre espace.");
      setIsLoading(false);
      return;
    }

    const bootstrapResponse = await fetch("/api/bootstrap-restaurant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantName,
        requestedSlug: slug,
        email,
      }),
    });

    if (!bootstrapResponse.ok) {
      const data = (await bootstrapResponse.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Impossible de créer le restaurant.");
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
          <span className={authBadgeClassName + " mb-6"}>Espace professionnel</span>
          <h1 className="mb-2 font-[family-name:var(--font-zg-display)] text-3xl font-bold tracking-tight text-landing-fg">
            Crée ton compte
          </h1>
          <p className="mb-4 text-sm text-landing-muted">
            Trois champs suffisent pour démarrer. Le reste se configure dans les paramètres.
          </p>
          <p className="max-w-sm text-pretty text-xs text-landing-muted/80">
            Aucune carte bancaire requise. Essai gratuit de 14 jours.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="restaurantName" className={authFieldLabel}>
              Nom du restaurant
            </label>
            <Input
              id="restaurantName"
              value={restaurantName}
              onChange={(event) => setRestaurantName(event.target.value)}
              className={authInputClassName}
              placeholder="Le Bistrot du Lac"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className={authFieldLabel}>
              Email professionnel
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={authInputClassName}
              placeholder="vous@restaurant.ch"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className={authFieldLabel}>
              Mot de passe
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={authInputClassName}
              placeholder="Au moins 6 caractères"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" disabled={isLoading} size="lg" variant="ghost" className={authSubmitClassName}>
            {isLoading ? "Création…" : "Créer mon compte"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs leading-relaxed text-landing-muted/80">
          Horaires, capacité, logo, page web et réseaux : tout se complète ensuite dans{" "}
          <span className="text-landing-muted">Paramètres</span>.
        </p>

        {error ? <p className={authErrorClassName + " mt-4"}>{error}</p> : null}
        {info ? (
          <p className="mt-4 rounded-xl border border-landing-accent/25 bg-landing-accent/10 px-3.5 py-3 text-sm font-medium text-landing-fg">
            {info}
          </p>
        ) : null}

        <p className="mt-6 text-center text-sm text-landing-muted">
          Déjà un compte ?{" "}
          <Link href="/login" className={authLinkClassName}>
            Se connecter
          </Link>
        </p>
      </ZenGrowAuthCard>
    </ZenGrowAuthPageShell>
  );
}
