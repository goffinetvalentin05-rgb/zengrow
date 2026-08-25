import { isSafeHttpUrl } from "@/src/lib/public-storefront/schema";

export function stripHtml(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\0/g, "");
}

export function plainText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return stripHtml(value).replace(/\s+/g, " ").trim().slice(0, max);
}

export function multilinePlainText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return stripHtml(value).replace(/\r\n/g, "\n").trim().slice(0, max);
}

export function sanitizeStoredUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
    return "";
  }
  if (!isSafeHttpUrl(trimmed)) return "";
  return trimmed.slice(0, 2000);
}

export function sanitizeStorefrontPayload(raw: unknown): unknown {
  if (raw == null || typeof raw !== "object") return raw;
  const input = raw as Record<string, unknown>;
  const style = isRecord(input.style) ? input.style : {};
  const hero = isRecord(input.hero) ? input.hero : {};
  const offers = isRecord(input.offers) ? input.offers : {};
  const about = isRecord(input.about) ? input.about : {};
  const gallery = isRecord(input.gallery) ? input.gallery : {};
  const footer = isRecord(input.footer) ? input.footer : {};

  return {
    ...input,
    style: {
      ...style,
      secondaryColor:
        typeof style.secondaryColor === "string" && style.secondaryColor.trim() === ""
          ? null
          : style.secondaryColor,
    },
    hero: {
      ...hero,
      title: plainText(hero.title, 120),
      subtitle: plainText(hero.subtitle, 280),
      ctaText: plainText(hero.ctaText, 40),
      coverImageUrl: sanitizeStoredUrl(hero.coverImageUrl),
    },
    offers: {
      ...offers,
      title: plainText(offers.title, 120),
      subtitle: plainText(offers.subtitle, 280),
      customButtonText: plainText(offers.customButtonText, 40),
    },
    about: {
      ...about,
      title: plainText(about.title, 120),
      body: multilinePlainText(about.body, 4000),
      imageUrl: sanitizeStoredUrl(about.imageUrl),
    },
    gallery: {
      ...gallery,
      images: Array.isArray(gallery.images)
        ? gallery.images.map((url) => sanitizeStoredUrl(url)).filter(Boolean).slice(0, 8)
        : [],
    },
    footer: {
      ...footer,
      text: plainText(footer.text, 280),
      showPoweredBy: true,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}
