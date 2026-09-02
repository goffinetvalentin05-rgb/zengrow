/**
 * URL publiques Sharpz — source unique pour le domaine.
 *
 * Production : https://sharpz.me (surcharge via NEXT_PUBLIC_SITE_URL)
 * Développement : http://localhost:3000 (ou l’origine courante côté client)
 *
 * NEXT_PUBLIC_SHARPZ_LINK_HOST : hôte affiché pour les liens courts (ex. sharpz.me/username)
 * NEXT_PUBLIC_APP_URL / APP_URL : alias legacy de NEXT_PUBLIC_SITE_URL
 */

export const PRODUCTION_SITE_HOST = "sharpz.me";
export const PRODUCTION_SITE_URL = `https://${PRODUCTION_SITE_HOST}`;
export const DEV_SITE_URL = "http://localhost:3000";

export function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function stripHostProtocol(value: string) {
  return value.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

export function isLocalHostname(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function withProtocol(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return stripTrailingSlash(trimmed);
  const host = stripHostProtocol(trimmed);
  if (!host) return "";
  const hostname = host.split(":")[0] ?? host;
  const protocol = isLocalHostname(hostname) ? "http" : "https";
  return `${protocol}://${host}`;
}

function envSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    ""
  );
}

export function getPublicSiteUrl(): string {
  const fromEnv = withProtocol(envSiteUrl());
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined" && window.location?.origin) {
    return stripTrailingSlash(window.location.origin);
  }

  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL) {
    return withProtocol(process.env.VERCEL_URL);
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  return DEV_SITE_URL;
}

/** Hôte affiché pour les liens publics courts. Indépendant de localhost. */
export function getSharpzLinkHost(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SHARPZ_LINK_HOST?.trim();
  if (fromEnv) return stripHostProtocol(fromEnv);
  return PRODUCTION_SITE_HOST;
}

export function getSharpzContactMailto(): string {
  return `mailto:contact@${getSharpzLinkHost()}`;
}

export function getSharpzBotUserAgent(detail?: string) {
  const url = getPublicSiteUrl();
  return detail ? `SharpzBot/1.0 (+${url}; ${detail})` : `SharpzBot/1.0 (+${url})`;
}

export function getAuthCallbackUrl(): string {
  return `${getPublicSiteUrl()}/auth/callback`;
}

export function getPasswordRecoveryRedirectUrl(): string {
  return `${getPublicSiteUrl()}/update-password`;
}

export function getRequestOrigin(headerList: Headers): string {
  const fromEnv = withProtocol(envSiteUrl());
  if (fromEnv) return fromEnv;

  const proto = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim() || "https";
  const host =
    headerList.get("x-forwarded-host")?.split(",")[0]?.trim() || headerList.get("host")?.trim() || "";
  if (host) {
    const hostname = host.split(":")[0] ?? host;
    const protocol = isLocalHostname(hostname) ? "http" : proto;
    return `${protocol}://${host}`;
  }

  return getPublicSiteUrl();
}

export function absoluteUrl(pathname = "/"): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${getPublicSiteUrl()}${path}`;
}
