import { normalizeSaasUrl } from "@/src/lib/sharpz/website-extract";
import type { ExtractedProspectContact, SourcedField } from "@/src/lib/sharpz/prospect-search/types";

const EMAIL_RE =
  /\b[a-z0-9][a-z0-9._%+-]{0,62}@[a-z0-9][a-z0-9.-]{0,62}\.[a-z]{2,}\b/gi;
const PHONE_RE =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,4}(?:[\s.-]?\d{1,4})?/g;

const GENERIC_EMAIL_PREFIXES = new Set([
  "noreply",
  "no-reply",
  "donotreply",
  "postmaster",
  "webmaster",
  "admin",
  "support",
  "help",
  "newsletter",
  "marketing",
  "privacy",
]);

function decode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(html: string) {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function isPlausibleEmail(value: string) {
  const email = value.toLowerCase();
  const [local, domain] = email.split("@");
  if (!local || !domain || domain.includes("example.")) return false;
  if (local.includes("sentry") || local.includes("webpack")) return false;
  if (GENERIC_EMAIL_PREFIXES.has(local)) return false;
  if (/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i.test(domain)) return false;
  return true;
}

function isPlausiblePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

function extractMailto(html: string, pageUrl: string): SourcedField | null {
  const matches = [...html.matchAll(/href=["']mailto:([^"'?#]+)["']/gi)];
  for (const match of matches) {
    const email = decode(match[1] ?? "").toLowerCase();
    if (isPlausibleEmail(email)) return { value: email, sourceUrl: pageUrl };
  }
  return null;
}

function extractTel(html: string, pageUrl: string): SourcedField | null {
  const matches = [...html.matchAll(/href=["']tel:([^"']+)["']/gi)];
  for (const match of matches) {
    const phone = decode(match[1] ?? "").replace(/\s+/g, " ").trim();
    if (isPlausiblePhone(phone)) return { value: phone, sourceUrl: pageUrl };
  }
  return null;
}

function extractLinkedIn(html: string, pageUrl: string): SourcedField | null {
  const matches = [...html.matchAll(/href=["'](https?:\/\/(?:[\w.-]+\.)?linkedin\.com\/[^"'#]+)["']/gi)];
  for (const match of matches) {
    const url = match[1]?.trim();
    if (url) return { value: url, sourceUrl: pageUrl };
  }
  return null;
}

function extractInstagram(html: string, pageUrl: string): SourcedField | null {
  const matches = [...html.matchAll(/href=["'](https?:\/\/(?:[\w.-]+\.)?instagram\.com\/[^"'#]+)["']/gi)];
  for (const match of matches) {
    const url = match[1]?.trim();
    if (url && !url.includes("/p/")) return { value: url, sourceUrl: pageUrl };
  }
  return null;
}

function extractEmailsFromText(text: string, pageUrl: string): SourcedField | null {
  const matches = text.match(EMAIL_RE) ?? [];
  for (const raw of matches) {
    const email = raw.toLowerCase();
    if (isPlausibleEmail(email)) return { value: email, sourceUrl: pageUrl };
  }
  return null;
}

function extractPhonesFromText(text: string, pageUrl: string): SourcedField | null {
  const matches = text.match(PHONE_RE) ?? [];
  for (const raw of matches) {
    const phone = raw.replace(/\s+/g, " ").trim();
    if (isPlausiblePhone(phone)) return { value: phone, sourceUrl: pageUrl };
  }
  return null;
}

function guessCityCountry(text: string) {
  const swissCities =
    /(?:Delémont|Delemont|Neuchâtel|Neuchatel|Lausanne|Genève|Geneve|Zurich|Berne|Bern|Bâle|Basel|Fribourg|Yverdon|Bienne|Biel|Jura|Vaud|Valais)/i;
  const cityMatch = text.match(swissCities);
  const city = cityMatch?.[0] ?? null;
  const country = /suisse|switzerland|schweiz|svizzera/i.test(text)
    ? "Suisse"
    : /france|français/i.test(text)
      ? "France"
      : null;
  return { city, country };
}

async function fetchHtml(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "SharpzBot/1.0 (+https://sharpz.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!response.ok) return null;
    return {
      html: (await response.text()).slice(0, 350_000),
      finalUrl: response.url || url,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function contactPaths(baseUrl: string) {
  const paths = ["/contact", "/contactez-nous", "/nous-contacter", "/about", "/a-propos"];
  try {
    const origin = new URL(baseUrl).origin;
    return [baseUrl, ...paths.map((path) => `${origin}${path}`)];
  } catch {
    return [baseUrl];
  }
}

export async function extractProspectContact(
  websiteUrl: string,
  fallbackTitle: string,
): Promise<ExtractedProspectContact | null> {
  let baseUrl: string;
  try {
    baseUrl = normalizeSaasUrl(websiteUrl);
  } catch {
    return null;
  }

  const pages = contactPaths(baseUrl).slice(0, 3);
  let email: SourcedField | null = null;
  let phone: SourcedField | null = null;
  let linkedinUrl: SourcedField | null = null;
  let instagramUrl: SourcedField | null = null;
  let officialName: string | null = null;
  let description: string | null = null;
  let contactPageUrl: string | null = null;
  let textSample = "";

  for (const pageUrl of pages) {
    const fetched = await fetchHtml(pageUrl);
    if (!fetched) continue;

    const { html, finalUrl } = fetched;
    const page = finalUrl || pageUrl;
    const plain = stripTags(html);
    textSample += ` ${plain}`;

    if (!officialName) {
      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      officialName = titleMatch?.[1] ? stripTags(titleMatch[1]) : fallbackTitle || null;
    }

    if (!description) {
      const meta =
        html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
        html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1];
      description = meta ? decode(meta) : plain.slice(0, 280) || null;
    }

    email = email ?? extractMailto(html, page) ?? extractEmailsFromText(plain, page);
    phone = phone ?? extractTel(html, page) ?? extractPhonesFromText(plain, page);
    linkedinUrl = linkedinUrl ?? extractLinkedIn(html, page);
    instagramUrl = instagramUrl ?? extractInstagram(html, page);

    if ((email || phone) && !contactPageUrl && /contact|contacter|nous/i.test(page)) {
      contactPageUrl = page;
    }
  }

  const { city, country } = guessCityCountry(textSample);

  return {
    officialName: officialName || fallbackTitle || null,
    description,
    city,
    country,
    website: baseUrl,
    email,
    phone,
    linkedinUrl,
    instagramUrl,
    contactPageUrl,
  };
}
