"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { PRODUCT } from "@/components/fitme-landing/config";
import { authErrorMessageFr } from "@/src/lib/auth-error-fr";
import { createClient } from "@/src/lib/supabase/client";

function recoveryRedirect() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/reset-password`;
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return `${site || "http://localhost:3000"}/reset-password`;
}

export default function ForgotPasswordPage() {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.trim() || !email.includes("@")) {
      setError("Adresse e-mail invalide.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: recoveryRedirect(),
      });
      setLoading(false);
      if (resetError) {
        setError(authErrorMessageFr(resetError, "Impossible d’envoyer l’e-mail. Réessayez."));
        return;
      }
      setSuccess(true);
    } catch {
      setLoading(false);
      setError("Connexion impossible. Vérifiez votre réseau et réessayez.");
    }
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
        <div className="fitme-auth-card">
          <p className="fitme-eyebrow">{PRODUCT.name}</p>
          {success ? (
            <>
              <div className="fitme-check" aria-hidden>
                <i />
              </div>
              <h1>E-mail envoyé.</h1>
              <p className="fitme-lead">
                Si un compte existe pour <strong>{email.trim()}</strong>, un lien de réinitialisation vient d’être
                envoyé. Il expire après quelques minutes.
              </p>
              <p className="fitme-success">Pensez à vérifier vos spams.</p>
            </>
          ) : (
            <>
              <h1>Récupérer l’accès.</h1>
              <p className="fitme-lead">
                Entrez l’e-mail de votre compte. Nous vous enverrons un lien pour choisir un nouveau mot de passe.
              </p>
              <form onSubmit={onSubmit} className="fitme-field" style={{ marginTop: "1.5rem" }}>
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
                <button className="fitme-cta fitme-cta--block" disabled={loading} type="submit">
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </button>
              </form>
            </>
          )}
          {error ? <p className="fitme-error">{error}</p> : null}
          <p className="fitme-fine" style={{ marginTop: "1.4rem" }}>
            <Link href="/login" className="fitme-app-bar__link">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </motion.div>
    </FitmeAppShell>
  );
}
