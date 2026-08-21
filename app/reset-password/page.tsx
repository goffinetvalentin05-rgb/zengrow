"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { PRODUCT } from "@/components/fitme-landing/config";
import { authErrorMessageFr } from "@/src/lib/auth-error-fr";
import { createClient } from "@/src/lib/supabase/client";

const MIN_LENGTH = 6;

type Phase = "checking" | "ready" | "invalid";

export default function FitmeResetPasswordPage() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let cancelled = false;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled && session) setPhase("ready");
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled && session) setPhase("ready");
    });

    const timeout = window.setTimeout(() => {
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled) return;
        setPhase(session ? "ready" : "invalid");
      });
    }, 2200);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent) {
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

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(
        authErrorMessageFr(updateError, "Impossible de mettre à jour le mot de passe. Demandez un nouveau lien."),
      );
      setLoading(false);
      return;
    }

    setSuccess(true);
    await supabase.auth.signOut();
    setLoading(false);
    window.setTimeout(() => router.push("/login"), 1800);
  }

  return (
    <FitmeAppShell
      right={
        <Link href="/login" className="fitme-app-bar__link">
          Connexion
        </Link>
      }
    >
      <motion.div
        className="fitme-auth"
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="fitme-auth-light" aria-hidden />
        <p className="fitme-eyebrow">{PRODUCT.name}</p>
        <h1>Nouveau mot de passe</h1>
        <p className="fitme-lead">Choisissez un mot de passe, puis reconnectez-vous.</p>

        {phase === "checking" ? <p className="fitme-note">Vérification du lien…</p> : null}

        {phase === "invalid" ? (
          <>
            <p className="fitme-error">Ce lien est invalide ou a expiré.</p>
            <Link href="/forgot-password" className="fitme-cta fitme-cta--block" style={{ marginTop: "1.2rem" }}>
              Demander un nouveau lien
            </Link>
          </>
        ) : null}

        {phase === "ready" && !success ? (
          <form onSubmit={handleSubmit} className="fitme-field" style={{ marginTop: "1.4rem" }}>
            <label htmlFor="new-password">Nouveau mot de passe</label>
            <input
              id="new-password"
              className="fitme-input"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_LENGTH}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <label htmlFor="confirm-password">Confirmer le mot de passe</label>
            <input
              id="confirm-password"
              className="fitme-input"
              type="password"
              autoComplete="new-password"
              required
              minLength={MIN_LENGTH}
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
            <button className="fitme-cta fitme-cta--block" type="submit" disabled={loading}>
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        ) : null}

        {success ? <p className="fitme-note">Mot de passe mis à jour. Redirection vers la connexion…</p> : null}
        {error ? <p className="fitme-error">{error}</p> : null}
      </motion.div>
    </FitmeAppShell>
  );
}
