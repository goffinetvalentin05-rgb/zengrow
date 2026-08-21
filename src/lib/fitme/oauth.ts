/** Relative post-OAuth path only. Blocks open redirects. */
export function safeAuthNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return "/start";
  }
  return value;
}

export function logFitmeOAuth(event: string, data?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") return;
  console.info("[fitme-oauth]", event, data ?? {});
}

/**
 * Unique URL de retour OAuth.
 * Local (next dev) : toujours http://localhost:3000/auth/callback
 * Prod : NEXT_PUBLIC_SITE_URL, sinon origin navigateur.
 */
export function getAuthCallbackUrl(): string {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000/auth/callback";
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (site) return `${site}/auth/callback`;

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/auth/callback`;
  }

  return "http://localhost:3000/auth/callback";
}

export function describeAuthorizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.host,
      pathname: parsed.pathname,
      redirect_to: parsed.searchParams.get("redirect_to"),
    };
  } catch {
    return { host: null, pathname: null, redirect_to: null };
  }
}
