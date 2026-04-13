/**
 * URL publique du site (sans slash final), pour les redirections Supabase (réinitialisation mot de passe, etc.).
 * En production, définir NEXT_PUBLIC_SITE_URL (ex. https://zengrow.ch).
 */
export function getPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

export function getPasswordRecoveryRedirectUrl(): string {
  const base = getPublicSiteUrl();
  return base ? `${base}/update-password` : "";
}
