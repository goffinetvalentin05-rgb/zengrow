import type { AuthError } from "@supabase/supabase-js";
import type { AppDictionary } from "@/src/locales/app/fr";

export type AuthErrorCopy = AppDictionary["auth"]["errors"];

export function translateAuthError(
  error: AuthError | null | undefined,
  t: AuthErrorCopy,
  fallback: string,
): string {
  if (!error) return fallback;
  const code = error.code ?? "";
  const msg = error.message.toLowerCase();

  if (code === "invalid_credentials" || msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return t.invalidCredentials;
  }
  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    msg.includes("already registered") ||
    msg.includes("already been registered") ||
    msg.includes("user already")
  ) {
    return t.alreadyRegistered;
  }
  if (code === "over_email_send_rate_limit" || msg.includes("rate limit") || msg.includes("too many")) {
    return t.rateLimit;
  }
  if (code === "email_address_invalid" || msg.includes("invalid email") || msg.includes("unable to validate email")) {
    return t.invalidEmail;
  }
  if (
    (msg.includes("password") && (msg.includes("weak") || msg.includes("least") || msg.includes("short") || msg.includes("6"))) ||
    code === "weak_password"
  ) {
    return t.weakPassword;
  }
  if (msg.includes("same as") || msg.includes("different from")) {
    return t.samePassword;
  }
  if (code === "session_not_found" || (msg.includes("session") && !msg.includes("expired jwt"))) {
    return t.sessionExpired;
  }
  if (msg.includes("failed to fetch") || msg.includes("network") || msg.includes("fetch")) {
    return t.network;
  }

  return fallback;
}

/** @deprecated Use translateAuthError with the active locale dictionary. */
export function authErrorMessageFr(error: AuthError | null | undefined, fallback: string): string {
  const fr: AuthErrorCopy = {
    invalidCredentials: "Email ou mot de passe incorrect.",
    alreadyRegistered: "Un compte existe déjà avec cet email. Connecte-toi.",
    rateLimit: "Trop de demandes. Patiente quelques minutes avant de réessayer.",
    invalidEmail: "Adresse email invalide.",
    weakPassword: "Le mot de passe est trop court. Utilise au moins 6 caractères.",
    samePassword: "Le nouveau mot de passe doit être différent de l’ancien.",
    sessionExpired: "Session expirée. Demande un nouveau lien de réinitialisation.",
    network: "Connexion impossible. Vérifie ton réseau et réessaie.",
    generic: "Impossible de se connecter. Réessaie.",
    signInFailed: "Impossible de se connecter. Vérifie ton email et ton mot de passe.",
    resetFailed: "Impossible d’envoyer l’email de réinitialisation. Réessaie plus tard.",
    updateFailed: "Impossible de mettre à jour le mot de passe. Réessaie ou demande un nouveau lien.",
  };
  return translateAuthError(error, fr, fallback);
}
