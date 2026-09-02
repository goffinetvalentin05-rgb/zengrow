import { USERNAME_PATTERN } from "@/src/lib/discovery/constants";
import { isReservedProfileSlug, normalizePublicSlug } from "@/src/lib/discovery/slug";
import { getPublicSiteUrl, getSharpzLinkHost, isLocalHostname } from "@/src/lib/site-url";

export type PublicSlugStatus = "available" | "taken" | "invalid" | "reserved" | "current";

export { getSharpzLinkHost };

function originFromValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `http://${trimmed}`);
    return { origin: `${url.protocol}//${url.host}`.replace(/\/+$/, ""), hostname: url.hostname };
  } catch {
    return null;
  }
}

export function profilePath(username: string) {
  return `/${normalizePublicSlug(username)}`;
}

export function getBrandedProfilePreview(username: string) {
  return `${getSharpzLinkHost()}${profilePath(username)}`;
}

/** URL that actually opens the profile in the current environment. */
export function getWorkingProfileUrl(username: string, origin?: string) {
  const path = profilePath(username);

  if (typeof window !== "undefined" && isLocalHostname(window.location.hostname)) {
    return `${window.location.origin}${path}`;
  }

  const explicit = origin ? originFromValue(origin) : null;
  if (explicit && isLocalHostname(explicit.hostname)) {
    return `${explicit.origin}${path}`;
  }

  if (typeof window !== "undefined") {
    const site = originFromValue(getPublicSiteUrl());
    if (site && !isLocalHostname(site.hostname)) return `${site.origin}${path}`;
    return `${window.location.origin}${path}`;
  }

  const site = originFromValue(getPublicSiteUrl());
  if (site) return `${site.origin}${path}`;
  if (explicit) return `${explicit.origin}${path}`;
  return path;
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
