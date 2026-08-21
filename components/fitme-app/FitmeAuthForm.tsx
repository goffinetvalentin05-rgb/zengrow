"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PRODUCT } from "@/components/fitme-landing/config";
import { FitmeAppShell } from "@/components/fitme-app/FitmeAppShell";
import { authErrorMessageFr } from "@/src/lib/auth-error-fr";
import { trackFitmeEvent } from "@/src/lib/fitme/analytics";
import { createClient } from "@/src/lib/supabase/client";

function googleRedirect() {
  const origin = window.location.origin;
  return `${origin}/auth/callback?next=/start`;
}

export function FitmeAuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/start";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace(next);
    });
  }, [next, router, supabase]);

  async function handleGoogle() {
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: googleRedirect() },
    });
    if (oauthError) {
      setError("Google n’est pas encore disponible. Utilisez e-mail et mot de passe.");
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "signup") {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: googleRedirect() },
      });
      if (signupError) {
        setError(authErrorMessageFr(signupError, signupError.message));
        setLoading(false);
        return;
      }
      if (!data.session) {
        setInfo("Compte créé. Confirmez votre e-mail puis reconnectez-vous.");
        setLoading(false);
        return;
      }
      trackFitmeEvent("signup_completed");
      router.push(next);
      router.refresh();
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(authErrorMessageFr(signInError, "E-mail ou mot de passe incorrect."));
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <FitmeAppShell
      right={
        <Link href={mode === "login" ? "/signup" : "/login"} className="fitme-app-bar__link">
          {mode === "login" ? "Créer un compte" : "Se connecter"}
        </Link>
      }
    >
      <div className="fitme-auth">
        <p className="fitme-eyebrow">{PRODUCT.name}</p>
        <h1>{mode === "login" ? "Bon retour." : "Créer un compte."}</h1>
        <p className="fitme-lead">
          {mode === "login"
            ? "Connectez-vous pour retrouver votre Style Profile."
            : "Quelques secondes suffisent. Ensuite, on s’occupe de votre style."}
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
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {mode === "login" ? (
            <p style={{ marginTop: "-0.2rem" }}>
              <Link href="/forgot-password" className="fitme-app-bar__link">
                Mot de passe oublié ?
              </Link>
            </p>
          ) : null}
          <button className="fitme-cta fitme-cta--block" type="submit" disabled={loading} style={{ marginTop: "0.6rem" }}>
            {loading ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>

        <div className="fitme-divider">ou</div>
        <button type="button" className="fitme-cta fitme-cta--ghost fitme-cta--block" onClick={handleGoogle}>
          Continuer avec Google
        </button>

        {error ? <p className="fitme-error">{error}</p> : null}
        {info ? <p className="fitme-note">{info}</p> : null}
      </div>
    </FitmeAppShell>
  );
}
