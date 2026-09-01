import { USERNAME_PATTERN } from "@/src/lib/discovery/constants";
import { isReservedProfileSlug, normalizePublicSlug } from "@/src/lib/discovery/slug";
import { getPublicSiteUrl } from "@/src/lib/site-url";

export type PublicSlugStatus = "available" | "taken" | "invalid" | "reserved" | "current";

const DEFAULT_LINK_HOST = "sharpz.me";

function stripHost(value: string) {
  return value.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export function getSharpzLinkHost() {
  const fromEnv = process.env.NEXT_PUBLIC_SHARPZ_LINK_HOST?.trim();
  if (fromEnv) return stripHost(fromEnv);
  return DEFAULT_LINK_HOST;
}

export function profilePath(username: string) {
  return `/${normalizePublicSlug(username)}`;
}

export function getBrandedProfilePreview(username: string) {
  return `${getSharpzLinkHost()}${profilePath(username)}`;
}

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

/** URL that actually opens the profile in the current environment. */
export function getWorkingProfileUrl(username: string, origin?: string) {
  const path = profilePath(username);
  const host = process.env.NEXT_PUBLIC_SHARPZ_LINK_HOST?.trim();

  if (typeof window !== "undefined") {
    if (isLocalHostname(window.location.hostname) || !host) {
      return `${window.location.origin}${path}`;
    }
    const cleaned = stripHost(host);
    const protocol = cleaned.startsWith("localhost") ? window.location.protocol : "https:";
    return `${protocol}//${cleaned}${path}`;
  }

  if (origin && !host) return `${origin.replace(/\/+$/, "")}${path}`;
  if (host) {
    const cleaned = stripHost(host);
    const protocol = cleaned.startsWith("localhost") ? "http:" : "https:";
    return `${protocol}//${cleaned}${path}`;
  }
  const site = getPublicSiteUrl();
  return site ? `${site}${path}` : path;
}

export function getProfileShareText(username: string) {
  return `Check out my Sharpz profile:\n${getBrandedProfilePreview(username)}`;
}

export function classifyPublicSlug(raw: string): Exclude<PublicSlugStatus, "available" | "taken" | "current"> | "ok" {
  const slug = normalizePublicSlug(raw);
  if (!slug) return "invalid";
  if (isReservedProfileSlug(slug)) return "reserved";
  if (!USERNAME_PATTERN.test(slug)) return "invalid";
  return "ok";
}

export function publicSlugStatusMessage(status: PublicSlugStatus) {
  switch (status) {
    case "available":
    case "current":
      return "Available";
    case "taken":
      return "Already taken";
    case "reserved":
      return "This link is reserved.";
    case "invalid":
      return "Invalid";
  }
}

function readSearchParam(
  search: string | URLSearchParams | Record<string, string | string[] | undefined> | null | undefined,
  key: string,
) {
  if (!search) return null;
  if (typeof search === "string") {
    return new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get(key);
  }
  if (search instanceof URLSearchParams) return search.get(key);
  const value = search[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function readUtmSource(search: string | URLSearchParams | Record<string, string | string[] | undefined> | null | undefined) {
  return readSearchParam(search, "utm_source");
}

export function readUtmMedium(search: string | URLSearchParams | Record<string, string | string[] | undefined> | null | undefined) {
  return readSearchParam(search, "utm_medium");
}

export function readUtmCampaign(search: string | URLSearchParams | Record<string, string | string[] | undefined> | null | undefined) {
  return readSearchParam(search, "utm_campaign");
}

export function referrerHostFromUrl(referrer: string | null | undefined, currentHost?: string | null) {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (!host) return null;
    if (currentHost && host === currentHost.replace(/^www\./, "").toLowerCase()) return null;
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

export function sanitizeTrackingPlatform(value: string | null | undefined) {
  if (!value) return null;
  const cleaned = value.trim().toLowerCase().slice(0, 40);
  if (!/^[a-z0-9._-]+$/.test(cleaned)) return null;
  return cleaned;
}
