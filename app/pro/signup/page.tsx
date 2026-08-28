"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthCard, ZenGrowAuthLayout } from "@/src/components/auth/zengrow-auth-page-shell";
import { createClient } from "@/src/lib/supabase/client";
import { slugifyRestaurantName } from "@/src/lib/utils";
import {
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

    router.push("/dashboard/onboarding");
  }

  return (
    <ZenGrowAuthLayout intent="signup" footerLine={null}>
      <AuthCard>
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-zg-display)] text-[1.75rem] font-semibold tracking-tight text-white sm:text-[2rem]">
            Créer votre espace
          </h1>
          <p className="mt-3 max-w-[38ch] text-pretty text-sm leading-relaxed text-white/50">
            Trois champs suffisent pour démarrer. Sharpz analysera ensuite votre SaaS.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/35">
            Aucune carte bancaire requise. Essai gratuit de 14 jours.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="restaurantName" className={authFieldLabel}>
              Nom de votre SaaS
            </label>
            <Input
              id="restaurantName"
              value={restaurantName}
              onChange={(event) => setRestaurantName(event.target.value)}
              className={authInputClassName}
              placeholder="Mon SaaS"
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
              placeholder="vous@startup.com"
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
            {isLoading ? "Création…" : "Créer mon espace"}
          </Button>
        </form>

        <p className="mt-5 text-xs leading-relaxed text-white/35">
          Canaux, objectifs et analyse : tout se complète ensuite dans l’onboarding Sharpz.
        </p>

        {error ? <p className={authErrorClassName + " mt-4"}>{error}</p> : null}
        {info ? (
          <p className="mt-4 rounded-xl border border-[#8b7cff]/25 bg-[#6e56cf]/15 px-3.5 py-3 text-sm font-medium text-[#f4f0ff]">
            {info}
          </p>
        ) : null}

        <p className="mt-6 text-sm text-white/45">
          Déjà un compte ?{" "}
          <Link href="/pro/login" className={authLinkClassName}>
            Se connecter
          </Link>
        </p>
      </AuthCard>
    </ZenGrowAuthLayout>
  );
}
