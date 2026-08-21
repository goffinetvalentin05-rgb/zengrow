import type { AuthError } from "@supabase/supabase-js";

/** Messages utilisateur en français pour les erreurs Auth Supabase courantes. */
export function authErrorMessageFr(error: AuthError | null | undefined, fallback: string): string {
  if (!error) {
    return fallback;
  }
  const code = error.code ?? "";
  const msg = error.message.toLowerCase();

  if (code === "invalid_credentials" || msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return "E-mail ou mot de passe incorrect.";
  }
  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    msg.includes("already registered") ||
    msg.includes("already been registered") ||
    msg.includes("user already")
  ) {
    return "Un compte existe déjà avec cet e-mail. Connectez-vous.";
  }
  if (code === "over_email_send_rate_limit" || msg.includes("rate limit") || msg.includes("too many")) {
    return "Trop de demandes. Patientez quelques minutes avant de réessayer.";
  }
  if (code === "email_address_invalid" || msg.includes("invalid email") || msg.includes("unable to validate email")) {
    return "Adresse e-mail invalide.";
  }
  if (
    (msg.includes("password") && (msg.includes("weak") || msg.includes("least") || msg.includes("short") || msg.includes("6"))) ||
    code === "weak_password"
  ) {
    return "Le mot de passe est trop court. Utilisez au moins 6 caractères.";
  }
  if (msg.includes("same as") || msg.includes("different from")) {
    return "Le nouveau mot de passe doit être différent de l’ancien.";
  }
  if (code === "session_not_found" || (msg.includes("session") && !msg.includes("expired jwt"))) {
    return "Session expirée. Demandez un nouveau lien de réinitialisation.";
  }
  if (msg.includes("failed to fetch") || msg.includes("network") || msg.includes("fetch")) {
    return "Connexion impossible. Vérifiez votre réseau et réessayez.";
  }

  return fallback;
}
