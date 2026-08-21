"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { PRODUCT } from "@/components/fitme-landing/config";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { authErrorMessageFr } from "@/src/lib/auth-error-fr";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";
import { getAuthCallbackUrl } from "@/src/lib/fitme/oauth";
import { createClient } from "@/src/lib/supabase/client";

const MIN_PASSWORD = 6;

export function FitmeAuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);
  const supabase = createClient();
  const reduce = useReducedMotion();

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace("/start");
    });
  }, [router, supabase]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Adresse e-mail invalide.");
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD} caractères.`);
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: getAuthCallbackUrl(),
          },
        });
        if (signupError) {
          setError(authErrorMessageFr(signupError, "Impossible de créer le compte. Réessayez."));
          setLoading(false);
          return;
        }
        if (!data.session) {
          setConfirmEmailSent(true);
          setLoading(false);
          return;
        }
        trackFitmeEvent("signup_completed");
        router.push("/start");
        router.refresh();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(authErrorMessageFr(signInError, "E-mail ou mot de passe incorrect."));
        setLoading(false);
        return;
      }
      router.push("/start");
      router.refresh();
    } catch {
      setError("Connexion impossible. Vérifiez votre réseau et réessayez.");
      setLoading(false);
    }
  }

  return (
    <FitmeAppShell
      right={
        <Link href={mode === "login" ? "/signup" : "/login"} className="fitme-app-bar__link">
          {mode === "login" ? "Créer un compte" : "Se connecter"}
        </Link>
      }
    >
      <motion.div
        className="fitme-auth"
        initial={reduce ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="fitme-auth-light" aria-hidden />
        <p className="fitme-eyebrow">{PRODUCT.name}</p>

        {confirmEmailSent ? (
          <>
            <h1>Vérifiez votre e-mail.</h1>
            <p className="fitme-lead">
              Un lien de confirmation a été envoyé à <strong>{email.trim()}</strong>. Ouvrez-le, puis reconnectez-vous.
            </p>
            <p className="fitme-note">Pensez à regarder vos spams si vous ne le voyez pas.</p>
            <Link href="/login" className="fitme-cta fitme-cta--block" style={{ marginTop: "1.4rem" }}>
              Se connecter
            </Link>
          </>
        ) : (
          <>
            <h1>{mode === "login" ? "Retrouvez votre Style Profile." : "Votre style commence ici."}</h1>
            <p className="fitme-lead">
              {mode === "login"
                ? "Connectez-vous pour continuer exactement là où vous vous êtes arrêté."
                : "Quelques photos. Une analyse. Ce qui vous va réellement."}
            </p>

            <form onSubmit={handleSubmit} className="fitme-field" style={{ marginTop: "1.6rem" }}>
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                className="fitme-input"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                className="fitme-input"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={MIN_PASSWORD}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {mode === "signup" ? (
                <>
                  <label htmlFor="confirm-password">Confirmer le mot de passe</label>
                  <input
                    id="confirm-password"
                    className="fitme-input"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={MIN_PASSWORD}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </>
              ) : (
                <p style={{ marginTop: "-0.2rem" }}>
                  <Link href="/forgot-password" className="fitme-app-bar__link">
                    Mot de passe oublié ?
                  </Link>
                </p>
              )}
              <button className="fitme-cta fitme-cta--block" type="submit" disabled={loading} style={{ marginTop: "0.6rem" }}>
                {loading ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
              </button>
            </form>

            {error ? <p className="fitme-error">{error}</p> : null}

            <p className="fitme-fine" style={{ marginTop: "1.4rem" }}>
              {mode === "login" ? (
                <>
                  Pas encore de compte ?{" "}
                  <Link href="/signup" className="fitme-app-bar__link">
                    Créer mon compte
                  </Link>
                </>
              ) : (
                <>
                  Déjà un compte ?{" "}
                  <Link href="/login" className="fitme-app-bar__link">
                    Se connecter
                  </Link>
                </>
              )}
            </p>
          </>
        )}
      </motion.div>
    </FitmeAppShell>
  );
}
