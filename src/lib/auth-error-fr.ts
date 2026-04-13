import type { AuthError } from "@supabase/supabase-js";

/** Messages utilisateur en français pour les erreurs Auth Supabase courantes. */
export function authErrorMessageFr(error: AuthError | null | undefined, fallback: string): string {
  if (!error) {
    return fallback;
  }
  const code = error.code ?? "";
  const msg = error.message.toLowerCase();

  if (code === "over_email_send_rate_limit" || msg.includes("rate limit") || msg.includes("too many")) {
    return "Trop de demandes. Patientez quelques minutes avant de réessayer.";
  }
  if (code === "email_address_invalid" || msg.includes("invalid email")) {
    return "Adresse e-mail invalide.";
  }
  if (msg.includes("password") && (msg.includes("weak") || msg.includes("least"))) {
    return "Le mot de passe est trop faible ou ne respecte pas les exigences de sécurité.";
  }
  if (msg.includes("same as") || msg.includes("different from")) {
    return "Le nouveau mot de passe doit être différent de l’ancien.";
  }
  if (code === "session_not_found" || msg.includes("session")) {
    return "Session expirée. Demandez un nouveau lien de réinitialisation.";
  }

  return fallback;
}
