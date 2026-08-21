"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ZenGrowAuthCard, ZenGrowAuthPageShell } from "@/src/components/auth/zengrow-auth-page-shell";
import { authErrorMessageFr } from "@/src/lib/auth-error-fr";
import {
  authBadgeClassName,
  authErrorClassName,
  authFieldLabel,
  authInputClassName,
  authLinkClassName,
  authSubmitClassName,
  authSuccessClassName,
} from "@/src/lib/auth/auth-form-styles";
import { getPasswordRecoveryRedirectUrl } from "@/src/lib/site-url";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    const redirectTo = getPasswordRecoveryRedirectUrl();
    if (!redirectTo) {
      setError("Configuration du site incomplète. Contactez le support.");
      setIsLoading(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setIsLoading(false);

    if (resetError) {
      setError(
        authErrorMessageFr(
          resetError,
          "Impossible d'envoyer l'e-mail de réinitialisation. Réessayez plus tard.",
        ),
      );
      return;
    }

    setSuccess(true);
  }

  return (
    <ZenGrowAuthPageShell variant="dark" footerLine={null}>
      <ZenGrowAuthCard variant="dark">
        <div className="mb-8 flex flex-col items-center text-center sm:mb-9">
          <p className="mb-2 font-[family-name:var(--font-zg-display)] text-3xl font-bold tracking-tight text-landing-fg">
            ZenGrow
          </p>
          <span className={authBadgeClassName + " mt-3"}>Sécurité du compte</span>
          <h1 className="mt-4 text-balance font-[family-name:var(--font-zg-display)] text-3xl font-bold tracking-tight text-landing-fg sm:text-[2rem] sm:leading-tight">
            Mot de passe oublié
          </h1>
          <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-landing-muted sm:text-[0.9375rem]">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {success ? (
          <div className={authSuccessClassName} role="status">
            Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.
          </div>
        ) : (
          <form className="relative space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="forgot-email" className={authFieldLabel}>
                Email
              </label>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="vous@restaurant.ch"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={authInputClassName}
              />
            </div>

            <Button type="submit" disabled={isLoading} size="lg" variant="ghost" className={authSubmitClassName}>
              {isLoading ? "Envoi en cours…" : "Envoyer le lien"}
            </Button>
          </form>
        )}

        <div className="mt-6 min-h-[1.25rem]" role="status" aria-live="polite" aria-atomic="true">
          {error ? <p className={authErrorClassName}>{error}</p> : null}
        </div>

        <p className="mt-6 text-center text-sm text-landing-muted">
          <Link href="/pro/login" className={authLinkClassName}>
            Retour à la connexion
          </Link>
        </p>
      </ZenGrowAuthCard>
    </ZenGrowAuthPageShell>
  );
}
