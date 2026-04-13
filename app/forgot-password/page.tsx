"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ZenGrowAuthCard, ZenGrowAuthPageShell } from "@/src/components/auth/zengrow-auth-page-shell";
import { authErrorMessageFr } from "@/src/lib/auth-error-fr";
import { getPasswordRecoveryRedirectUrl } from "@/src/lib/site-url";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";

const inputClassName =
  "rounded-xl border-[#CBE6DF] bg-white/90 text-[#0F3F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] placeholder:text-[#0F3F3A]/35 focus:border-[#1F7A6C]/45 focus:ring-[#1F7A6C]/18";

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
    <ZenGrowAuthPageShell>
      <ZenGrowAuthCard>
        <div className="mb-8 flex flex-col items-center text-center sm:mb-9">
          <Image
            src="/Zengrow-logo.png"
            alt="ZenGrow"
            width={200}
            height={56}
            className="h-10 w-auto object-contain sm:h-11"
            priority
          />
          <span className="mt-5 inline-flex rounded-full border border-[#CBE6DF] bg-[#F0F9F7]/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1F7A6C] sm:text-xs sm:tracking-[0.16em]">
            Sécurité du compte
          </span>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-[#0F3F3A] sm:text-[2rem] sm:leading-tight">
            Mot de passe oublié
          </h1>
          <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-[#0F3F3A]/75 sm:text-[0.9375rem]">
            Entrez votre adresse email pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {success ? (
          <div
            className="rounded-xl border border-[#CBE6DF] bg-[#F0F9F7] px-4 py-4 text-center text-sm leading-relaxed text-[#0F3F3A]"
            role="status"
          >
            Si un compte existe avec cette adresse, un email de réinitialisation a été envoyé.
          </div>
        ) : (
          <form className="relative space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="forgot-email" className="dashboard-field-label">
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
                className={inputClassName}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="h-12 w-full rounded-xl border-0 bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] text-[15px] font-semibold text-white shadow-[0_16px_40px_-18px_rgba(31,122,108,0.75)] transition hover:scale-[1.01] hover:from-[#1a6b5f] hover:to-[#36b892] hover:shadow-[0_20px_44px_-16px_rgba(31,122,108,0.65)] focus-visible:ring-[#1F7A6C]/45 active:scale-[0.99] disabled:hover:scale-100"
            >
              {isLoading ? "Envoi en cours…" : "Envoyer le lien"}
            </Button>
          </form>
        )}

        <div
          className="mt-6 min-h-[1.25rem]"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {error ? (
            <p className="rounded-xl border border-red-200/90 bg-red-50/95 px-3.5 py-3 text-sm leading-snug text-red-800 shadow-sm">
              {error}
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-center text-sm text-[#0F3F3A]/60">
          <Link
            href="/login"
            className="font-semibold text-[#1F7A6C] underline decoration-[#1F7A6C]/25 underline-offset-2 transition hover:text-[#176657] hover:decoration-[#1F7A6C]/50"
          >
            Retour à la connexion
          </Link>
        </p>
      </ZenGrowAuthCard>
    </ZenGrowAuthPageShell>
  );
}
