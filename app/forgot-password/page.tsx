"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { authErrorMessageFr } from "@/src/lib/auth-error-fr";
import { getPasswordRecoveryRedirectUrl } from "@/src/lib/site-url";
import { createClient } from "@/src/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    const redirectTo = getPasswordRecoveryRedirectUrl();
    if (!redirectTo) {
      setError("Configuration du site incomplète.");
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setLoading(false);
    if (resetError) {
      setError(authErrorMessageFr(resetError, "Impossible d’envoyer l’e-mail."));
      return;
    }
    setSuccess(true);
  }

  return (
    <FitmeAppShell
      right={
        <Link href="/login" className="fitme-app-bar__link">
          Connexion
        </Link>
      }
    >
      <div className="fitme-auth">
        <p className="fitme-eyebrow">Compte</p>
        <h1>Mot de passe oublié</h1>
        <p className="fitme-lead">Entrez votre e-mail pour recevoir un lien de réinitialisation.</p>
        {success ? (
          <p className="fitme-note">Si un compte existe, un e-mail vient d’être envoyé.</p>
        ) : (
          <form onSubmit={onSubmit} className="fitme-field" style={{ marginTop: "1.5rem" }}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              className="fitme-input"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button className="fitme-cta fitme-cta--block" disabled={loading} type="submit">
              {loading ? "Envoi…" : "Envoyer le lien"}
            </button>
          </form>
        )}
        {error ? <p className="fitme-error">{error}</p> : null}
      </div>
    </FitmeAppShell>
  );
}
