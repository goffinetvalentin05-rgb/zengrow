"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ZenGrowAuthCard, ZenGrowAuthPageShell } from "@/src/components/auth/zengrow-auth-page-shell";
import { authErrorMessageFr } from "@/src/lib/auth-error-fr";
import { createClient } from "@/src/lib/supabase/client";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";

const inputClassName =
  "rounded-xl border-[#CBE6DF] bg-white/90 text-[#0F3F3A] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] placeholder:text-[#0F3F3A]/35 focus:border-[#1F7A6C]/45 focus:ring-[#1F7A6C]/18";

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
            Nouveau mot de passe
          </h1>
          <p className="mt-2 max-w-sm text-pretty text-sm leading-relaxed text-[#0F3F3A]/75 sm:text-[0.9375rem]">
            Choisissez un nouveau mot de passe sécurisé.
          </p>
        </div>

        {phase === "checking" ? (
          <p className="py-6 text-center text-sm text-[#0F3F3A]/65">Vérification du lien…</p>
        ) : null}

        {phase === "invalid" ? (
          <div className="space-y-5 text-center">
            <p className="rounded-xl border border-amber-200/90 bg-amber-50/95 px-3.5 py-3 text-sm leading-relaxed text-amber-950">
              Ce lien est invalide ou a expiré. Demandez un nouveau lien de réinitialisation.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <Link
                href="/forgot-password"
                className="font-semibold text-[#1F7A6C] underline decoration-[#1F7A6C]/25 underline-offset-2"
              >
                Demander un nouveau lien
              </Link>
              <Link href="/login" className="text-[#0F3F3A]/60 transition hover:text-[#0F3F3A]">
                Retour à la connexion
              </Link>
            </div>
          </div>
        ) : null}

        {phase === "ready" && !success ? (
          <form className="relative space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="new-password" className="dashboard-field-label">
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
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="dashboard-field-label">
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
                className={inputClassName}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="h-12 w-full rounded-xl border-0 bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] text-[15px] font-semibold text-white shadow-[0_16px_40px_-18px_rgba(31,122,108,0.75)] transition hover:scale-[1.01] hover:from-[#1a6b5f] hover:to-[#36b892] hover:shadow-[0_20px_44px_-16px_rgba(31,122,108,0.65)] focus-visible:ring-[#1F7A6C]/45 active:scale-[0.99] disabled:hover:scale-100"
            >
              {isLoading ? "Enregistrement en cours…" : "Enregistrer le nouveau mot de passe"}
            </Button>
          </form>
        ) : null}

        {phase === "ready" && success ? (
          <p
            className="rounded-xl border border-[#CBE6DF] bg-[#F0F9F7] px-4 py-4 text-center text-sm leading-relaxed text-[#0F3F3A]"
            role="status"
          >
            Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter.
          </p>
        ) : null}

        {phase === "ready" && !success ? (
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
        ) : null}

        {phase === "ready" ? (
          <p className="mt-6 text-center text-sm text-[#0F3F3A]/60">
            <Link
              href="/login"
              className="font-semibold text-[#1F7A6C] underline decoration-[#1F7A6C]/25 underline-offset-2 transition hover:text-[#176657] hover:decoration-[#1F7A6C]/50"
            >
              Retour à la connexion
            </Link>
          </p>
        ) : null}
      </ZenGrowAuthCard>
    </ZenGrowAuthPageShell>
  );
}
