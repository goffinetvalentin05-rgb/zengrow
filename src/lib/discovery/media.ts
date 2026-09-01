import { AGE_RANGES } from "@/src/lib/discovery/constants";

export function parseYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id && id.length >= 8 ? id : null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v) return v;
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") {
        return parts[1] ?? null;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function youtubeThumbnailUrl(url: string): string | null {
  const id = parseYoutubeId(url);
  if (!id) return null;
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function resolveFeaturedThumbnail(input: {
  platform: string;
  url: string;
  thumbnailUrl?: string | null;
}): string | null {
  if (input.thumbnailUrl) return input.thumbnailUrl;
  if (input.platform === "youtube") return youtubeThumbnailUrl(input.url);
  return null;
}

export function parseSocialHandle(platform: string, url: string): string | null {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (platform === "website") {
      return parsed.hostname.replace(/^www\./, "");
    }
    if (!parts.length) return null;
    const handle = parts[0].replace(/^@/, "");
    if (["in", "company", "c", "channel", "user", "watch", "reel", "reels", "p", "shorts"].includes(handle.toLowerCase())) {
      return parts[1]?.replace(/^@/, "") ?? null;
    }
    return handle || null;
  } catch {
    const match = url.match(/@?([A-Za-z0-9._-]{2,40})/);
    return match?.[1] ?? null;
  }
}

export function formatLocation(location?: string | null, country?: string | null) {
  if (location && country && location !== country) return `${location}, ${country}`;
  return location || country || null;
}

export function ageFromBirthDate(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const date = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const month = now.getMonth() - date.getMonth();
  if (month < 0 || (month === 0 && now.getDate() < date.getDate())) age -= 1;
  return age >= 18 ? age : null;
}

export const COUNTRY_PRESETS = [
  "Switzerland",
  "France",
  "Belgium",
  "Dubai",
  "United Arab Emirates",
  "Germany",
  "Spain",
  "United Kingdom",
  "United States",
  "Portugal",
  "Netherlands",
] as const;

export function birthDateBounds(ageId: string | null | undefined): { minBirth: string | null; maxBirth: string } | null {
  const range = AGE_RANGES.find((item) => item.id === ageId);
  if (!range) return null;
  return {
    maxBirth: isoYearsAgo(range.min),
    minBirth: range.max == null ? null : isoYearsAgo(range.max + 1),
  };
}

function isoYearsAgo(years: number) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
}

export function isAdultBirthDate(value: string) {
  return (ageFromBirthDate(value) ?? 0) >= 18;
}

export function sanitizeIlike(value: string) {
  return value.replace(/[%_,()]/g, " ").trim().slice(0, 80);
}

export function normalizeHttpUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
