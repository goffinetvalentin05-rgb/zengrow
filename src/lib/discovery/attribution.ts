import { SOCIAL_PLATFORM_LABELS, type SocialPlatform } from "@/src/lib/discovery/constants";
import { getBrandedProfilePreview, getWorkingProfileUrl, profilePath } from "@/src/lib/discovery/public-link";
import { isReservedProfileSlug } from "@/src/lib/discovery/slug";

export const TRACKED_BIO_PLATFORMS = ["instagram", "tiktok", "youtube", "linkedin", "x"] as const;
export type TrackedBioPlatform = (typeof TRACKED_BIO_PLATFORMS)[number];

/** Short path codes copied into bios. Closed set — never accept arbitrary segments. */
export const TRACKED_BIO_SOURCE_CODES = {
  ig: "instagram",
  tt: "tiktok",
  yt: "youtube",
  in: "linkedin",
  x: "x",
} as const satisfies Record<string, TrackedBioPlatform>;

export type TrackedBioSourceCode = keyof typeof TRACKED_BIO_SOURCE_CODES;

const PLATFORM_TO_SOURCE_CODE: Record<TrackedBioPlatform, TrackedBioSourceCode> = {
  instagram: "ig",
  tiktok: "tt",
  youtube: "yt",
  linkedin: "in",
  x: "x",
};

export type TrackedBioAttribution = {
  code: TrackedBioSourceCode;
  platform: TrackedBioPlatform;
  utmSource: TrackedBioPlatform;
  utmMedium: "bio";
};

export const SHARPZ_INTERNAL_SOURCES = [
  "sharpz_explore",
  "sharpz_search",
  "sharpz_category",
  "sharpz_following",
  "sharpz_saved",
  "sharpz_recommendation",
] as const;

export type SharpzInternalSource = (typeof SHARPZ_INTERNAL_SOURCES)[number];

const FROM_TO_INTERNAL: Record<string, SharpzInternalSource> = {
  explore: "sharpz_explore",
  search: "sharpz_search",
  category: "sharpz_category",
  following: "sharpz_following",
  saved: "sharpz_saved",
  recommendation: "sharpz_recommendation",
  sharpz_explore: "sharpz_explore",
  sharpz_search: "sharpz_search",
  sharpz_category: "sharpz_category",
  sharpz_following: "sharpz_following",
  sharpz_saved: "sharpz_saved",
  sharpz_recommendation: "sharpz_recommendation",
};

const KNOWN_EXTERNAL = ["instagram", "tiktok", "youtube", "linkedin", "x"] as const;

const REFERRER_TO_PLATFORM: Record<string, (typeof KNOWN_EXTERNAL)[number]> = {
  "instagram.com": "instagram",
  "instagr.am": "instagram",
  "tiktok.com": "tiktok",
  "youtube.com": "youtube",
  "youtu.be": "youtube",
  "linkedin.com": "linkedin",
  "lnkd.in": "linkedin",
  "twitter.com": "x",
  "x.com": "x",
};

export const TRAFFIC_SOURCE_LABELS: Record<string, string> = {
  sharpz_explore: "Sharpz Explore",
  sharpz_search: "Sharpz Search",
  sharpz_category: "Sharpz Category",
  sharpz_following: "Sharpz Following",
  sharpz_saved: "Sharpz Saved",
  sharpz_recommendation: "Sharpz",
  explore: "Sharpz Explore",
  search: "Sharpz Search",
  category: "Sharpz Category",
  following: "Sharpz Following",
  saved: "Sharpz Saved",
  instagram: "Instagram",
  instagram_bio: "Instagram",
  tiktok: "TikTok",
  tiktok_bio: "TikTok",
  youtube: "YouTube",
  youtube_bio: "YouTube",
  linkedin: "LinkedIn",
  linkedin_bio: "LinkedIn",
  x: "X",
  x_bio: "X",
  direct: "Direct",
  other: "Other",
  website: "Other",
};

export function normalizeStoredSource(value: string | null | undefined): string {
  if (!value) return "direct";
  const cleaned = value.trim().toLowerCase();
  if (FROM_TO_INTERNAL[cleaned]) return FROM_TO_INTERNAL[cleaned];
  if ((KNOWN_EXTERNAL as readonly string[]).includes(cleaned)) return cleaned;
  if (cleaned === "direct" || cleaned === "website" || cleaned === "other") return cleaned === "website" ? "other" : cleaned;
  return "direct";
}

export function isSharpzInternalSource(key: string) {
  return key.startsWith("sharpz_") || ["explore", "search", "category", "following", "saved"].includes(key);
}

export function referrerToPlatform(host: string | null | undefined): (typeof KNOWN_EXTERNAL)[number] | null {
  if (!host) return null;
  const cleaned = host.replace(/^www\./, "").toLowerCase();
  if (REFERRER_TO_PLATFORM[cleaned]) return REFERRER_TO_PLATFORM[cleaned];
  const base = Object.keys(REFERRER_TO_PLATFORM).find((known) => cleaned.endsWith(`.${known}`));
  return base ? REFERRER_TO_PLATFORM[base] : null;
}

export function classifyTrafficSource(input: {
  source?: string | null;
  utmSource?: string | null;
  referrerHost?: string | null;
  platform?: string | null;
}): string {
  const internal = input.source ? FROM_TO_INTERNAL[input.source.trim().toLowerCase()] : null;
  if (internal) return internal;

  const utm = input.utmSource?.trim().toLowerCase() ?? "";
  if ((KNOWN_EXTERNAL as readonly string[]).includes(utm)) return utm;
  if (utm) return "other";

  const fromReferrer = referrerToPlatform(input.referrerHost);
  if (fromReferrer) return fromReferrer;
  if (input.referrerHost) return "other";

  const source = input.source?.trim().toLowerCase() ?? "";
  if ((KNOWN_EXTERNAL as readonly string[]).includes(source)) return source;

  const platform = input.platform?.trim().toLowerCase() ?? "";
  if (!source || source === "direct") {
    if ((KNOWN_EXTERNAL as readonly string[]).includes(platform)) return platform;
  }

  return "direct";
}

export function trafficSourceLabel(key: string) {
  return TRAFFIC_SOURCE_LABELS[key] ?? (SOCIAL_PLATFORM_LABELS[key as SocialPlatform] ?? key);
}

export function splitTrafficSources(rows: { key: string; count: number }[]) {
  let discovery = 0;
  let external = 0;
  for (const row of rows) {
    if (isSharpzInternalSource(row.key)) discovery += row.count;
    else external += row.count;
  }
  const total = discovery + external;
  return {
    discovery,
    external,
    discoveryShare: total ? Math.round((discovery / total) * 100) : 0,
    externalShare: total ? Math.round((external / total) * 100) : 0,
  };
}

export function trackedBioSourceCode(platform: TrackedBioPlatform): TrackedBioSourceCode {
  return PLATFORM_TO_SOURCE_CODE[platform];
}

export function resolveTrackedBioFromSourceCode(code: string | null | undefined): TrackedBioAttribution | null {
  if (!code) return null;
  const cleaned = code.trim().toLowerCase();
  if (!(cleaned in TRACKED_BIO_SOURCE_CODES)) return null;
  const typed = cleaned as TrackedBioSourceCode;
  const platform = TRACKED_BIO_SOURCE_CODES[typed];
  return { code: typed, platform, utmSource: platform, utmMedium: "bio" };
}

export function readTrackedSourceFromPathname(pathname: string | null | undefined): TrackedBioAttribution | null {
  if (!pathname) return null;
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2) return null;
  const first = segments[0]?.toLowerCase() ?? "";
  if (isReservedProfileSlug(first)) return null;
  return resolveTrackedBioFromSourceCode(segments[segments.length - 1]);
}

/** Stored UTM pair for a bio link. Not shown in the public URL. */
export function trackedProfileQuery(platform: TrackedBioPlatform) {
  return `utm_source=${platform}&utm_medium=bio`;
}

export function getBrandedTrackedProfileUrl(username: string, platform: TrackedBioPlatform) {
  return `${getBrandedProfilePreview(username)}/${trackedBioSourceCode(platform)}`;
}

export function getWorkingTrackedProfileUrl(username: string, platform: TrackedBioPlatform, origin?: string) {
  return `${getWorkingProfileUrl(username, origin)}/${trackedBioSourceCode(platform)}`;
}

export function trackedProfilePath(username: string, platform: TrackedBioPlatform) {
  return `${profilePath(username)}/${trackedBioSourceCode(platform)}`;
}
