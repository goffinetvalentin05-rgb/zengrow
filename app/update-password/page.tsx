"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";

type LinkPhase = "checking" | "ready" | "invalid";

const MIN_LENGTH = 8;

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<LinkPhase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session) {
        setPhase("ready");
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled && session) {
        setPhase("ready");
      }
    });

    const t1 = window.setTimeout(() => {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (!cancelled && session) {
          setPhase("ready");
        }
      });
    }, 400);

    const t2 = window.setTimeout(() => {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled) {
          return;
        }
        if (session) {
          setPhase("ready");
        } else {
          setPhase((current) => (current === "ready" ? "ready" : "invalid"));
        }
      });
    }, 2200);

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`);
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(
        authErrorMessageFr(
          updateError,
          "Impossible de mettre à jour le mot de passe. Réessayez ou demandez un nouveau lien.",
        ),
      );
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    await supabase.auth.signOut();
    setIsLoading(false);

    window.setTimeout(() => {
      router.push("/login");
    }, 2200);
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
            Nouveau mot de passe
          </h1>
          <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-landing-muted sm:text-[0.9375rem]">
            Choisissez un nouveau mot de passe sécurisé.
          </p>
        </div>

        {phase === "checking" ? (
          <p className="py-6 text-center text-sm text-landing-muted">Vérification du lien…</p>
        ) : null}

        {phase === "invalid" ? (
          <div className="space-y-5 text-center">
            <p className="rounded-xl border border-amber-500/30 bg-amber-950/40 px-3.5 py-3 text-sm leading-relaxed text-amber-100/90">
              Ce lien est invalide ou a expiré. Demandez un nouveau lien de réinitialisation.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/forgot-password" className={authLinkClassName}>
                Demander un nouveau lien
              </Link>
              <Link href="/login" className="text-landing-muted transition hover:text-landing-fg">
                Retour à la connexion
              </Link>
            </div>
          </div>
        ) : null}

        {phase === "ready" && !success ? (
          <form className="relative space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="new-password" className={authFieldLabel}>
                Nouveau mot de passe
              </label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Au moins 8 caractères"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={MIN_LENGTH}
                className={authInputClassName}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className={authFieldLabel}>
                Confirmer le mot de passe
              </label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Répétez le mot de passe"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                required
                minLength={MIN_LENGTH}
                className={authInputClassName}
              />
            </div>

            <Button type="submit" disabled={isLoading} size="lg" variant="ghost" className={authSubmitClassName}>
              {isLoading ? "Enregistrement en cours…" : "Enregistrer le nouveau mot de passe"}
            </Button>
          </form>
        ) : null}

        {phase === "ready" && success ? (
          <p className={authSuccessClassName} role="status">
            Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
          </p>
        ) : null}

        {phase === "ready" && !success ? (
          <div className="mt-6 min-h-[1.25rem]" role="status" aria-live="polite" aria-atomic="true">
            {error ? <p className={authErrorClassName}>{error}</p> : null}
          </div>
        ) : null}

        {phase === "ready" ? (
          <p className="mt-6 text-center text-sm text-landing-muted">
            <Link href="/login" className={authLinkClassName}>
              Retour à la connexion
            </Link>
          </p>
        ) : null}
      </ZenGrowAuthCard>
    </ZenGrowAuthPageShell>
  );
}
