import {
  WebsiteExtractError,
  normalizeSaasUrl,
} from "@/src/lib/sharpz/website-extract";
import type { CompetitorPlan, CompetitorSnapshotData } from "@/src/lib/sharpz/competitor-watch/diff";
import { hashSnapshot } from "@/src/lib/sharpz/competitor-watch/diff";

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
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function metaContent(html: string, names: string[]) {
  for (const name of names) {
    const property = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(`<meta[^>]+(?:name|property)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${property}["']`, "i"),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return decode(match[1]);
    }
  }
  return null;
}

async function fetchHtml(inputUrl: string): Promise<{ url: string; finalUrl: string; html: string; status: number }> {
  const url = normalizeSaasUrl(inputUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "SharpzBot/1.0 (+https://sharpz.app; competitor-watch)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    const html = (await response.text()).slice(0, 450_000);
    return { url, finalUrl: response.url || url, html, status: response.status };
  } catch {
    throw new WebsiteExtractError("Impossible d’accéder à ce site.");
  } finally {
    clearTimeout(timeout);
  }
}

const PRICING_HREF =
  /href=["']([^"']*(?:pricing|tarifs?|tarification|plans?|abonnement)[^"']*)["']/gi;

export function discoverPricingUrl(homepageHtml: string, baseUrl: string): string | null {
  let base: URL;
  try {
    base = new URL(baseUrl);
  } catch {
    return null;
  }
  const candidates: string[] = [];
  for (const match of homepageHtml.matchAll(PRICING_HREF)) {
    const raw = match[1];
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("javascript:")) continue;
    try {
      const absolute = new URL(raw, base).toString();
      if (absolute.startsWith("http")) candidates.push(absolute.split("#")[0]!);
    } catch {
      /* ignore */
    }
  }
  // Prefer same-host /pricing style
  const sameHost = candidates.filter((c) => {
    try {
      return new URL(c).hostname === base.hostname;
    } catch {
      return false;
    }
  });
  return sameHost[0] ?? candidates[0] ?? null;
}

function extractCta(html: string): string | null {
  const patterns = [
    /<(?:a|button)[^>]*>\s*((?:Start|Get|Try|Book|Demander|Essayer|Commencer|S.?inscrire|Sign up|Free trial)[^<]{0,60})\s*<\/(?:a|button)>/gi,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match?.[1]) {
      const text = stripTags(match[1]);
      if (text.length >= 2 && text.length <= 80) return text;
    }
  }
  return null;
}

const PRICE_RE =
  /(?:€|\$|£|CHF|EUR|USD)\s?\d[\d\s.,]*|\d[\d\s.,]*\s?(?:€|\$|£|CHF|EUR|USD|\/mois|\/month|\/mo\b)/gi;

export function extractPlansFromPricingText(text: string): CompetitorPlan[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const plans: CompetitorPlan[] = [];
  const priceMatches = [...cleaned.matchAll(PRICE_RE)].slice(0, 8);
  for (const match of priceMatches) {
    const price = match[0].replace(/\s+/g, " ").trim();
    const idx = match.index ?? 0;
    const window = cleaned.slice(Math.max(0, idx - 48), idx).trim();
    const nameGuess =
      window
        .split(/[·|/•\-–—]/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 2 && s.length <= 40)
        .pop() ?? null;
    const period = /mois|month|\/mo\b|annuel|year|\/yr/i.test(cleaned.slice(idx, idx + 40))
      ? cleaned.slice(idx, idx + 40).match(/mois|month|\/mo|annuel|year|\/yr/i)?.[0] ?? null
      : null;
    plans.push({
      name: nameGuess && !PRICE_RE.test(nameGuess) ? nameGuess : `Plan ${plans.length + 1}`,
      price,
      period,
    });
  }

  // Dedupe by price
  const seen = new Set<string>();
  return plans.filter((p) => {
    const key = p.price.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function extractHomepageFields(html: string, finalUrl: string) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch?.[1] ? stripTags(titleMatch[1]) : null;
  const description = metaContent(html, ["description", "og:description", "twitter:description"]);
  const h1 = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((m) => stripTags(m[1] ?? ""))
    .find((t) => t.length >= 3);
  const cta = extractCta(html);
  return {
    title: title?.slice(0, 200) ?? null,
    description: description?.slice(0, 400) ?? null,
    hero: (h1 ?? description)?.slice(0, 300) ?? null,
    cta,
    homepageUrl: finalUrl,
  };
}

export type BuiltSnapshot = {
  data: CompetitorSnapshotData;
  contentHash: string;
  sourceUrls: string[];
  fetchStatus: "ok" | "unavailable" | "error";
  errorMessage: string | null;
  discoveredPricingUrl: string | null;
  suggestedName: string | null;
};

/**
 * Construit un snapshot observable (pas de HTML brut stocké).
 * pricing_url : fournie ou découverte via liens publics — jamais inventée.
 */
export async function buildCompetitorSnapshot(input: {
  websiteUrl: string;
  pricingUrl?: string | null;
}): Promise<BuiltSnapshot> {
  let homepage;
  try {
    homepage = await fetchHtml(input.websiteUrl);
  } catch (error) {
    const message = error instanceof WebsiteExtractError ? error.message : "Impossible d’accéder à ce site.";
    const data: CompetitorSnapshotData = {
      title: null,
      description: null,
      hero: null,
      cta: null,
      pricingText: null,
      plans: [],
      homepageUrl: input.websiteUrl,
      pricingUrl: input.pricingUrl ?? null,
    };
    return {
      data,
      contentHash: hashSnapshot(data),
      sourceUrls: [input.websiteUrl],
      fetchStatus: "unavailable",
      errorMessage: message,
      discoveredPricingUrl: null,
      suggestedName: null,
    };
  }

  if (homepage.status >= 400) {
    const data: CompetitorSnapshotData = {
      title: null,
      description: null,
      hero: null,
      cta: null,
      pricingText: null,
      plans: [],
      homepageUrl: homepage.finalUrl,
      pricingUrl: input.pricingUrl ?? null,
    };
    return {
      data,
      contentHash: hashSnapshot(data),
      sourceUrls: [homepage.finalUrl],
      fetchStatus: homepage.status === 404 ? "unavailable" : "error",
      errorMessage: `Le site a répondu ${homepage.status}.`,
      discoveredPricingUrl: null,
      suggestedName: null,
    };
  }

  const home = extractHomepageFields(homepage.html, homepage.finalUrl);
  const discovered = discoverPricingUrl(homepage.html, homepage.finalUrl);
  const pricingUrl = input.pricingUrl?.trim() || discovered;

  let pricingText: string | null = null;
  let plans: CompetitorPlan[] = [];
  const sourceUrls = [homepage.finalUrl];

  if (pricingUrl) {
    try {
      const pricingPage = await fetchHtml(pricingUrl);
      if (pricingPage.status < 400) {
        sourceUrls.push(pricingPage.finalUrl);
        pricingText = stripTags(pricingPage.html).slice(0, 4000);
        plans = extractPlansFromPricingText(pricingText);
      }
    } catch {
      // Pricing page absente / inaccessible → null, pas d'invention
    }
  }

  // Fallback: pricing signals on homepage only
  if (!pricingText) {
    const homeText = stripTags(homepage.html);
    if (/pricing|tarif|abonnement|€|\$|CHF/i.test(homeText)) {
      pricingText = homeText.slice(0, 2500);
      if (plans.length === 0) plans = extractPlansFromPricingText(pricingText);
    }
  }

  const siteName = metaContent(homepage.html, ["og:site_name", "application-name"]);
  const data: CompetitorSnapshotData = {
    title: home.title,
    description: home.description,
    hero: home.hero,
    cta: home.cta,
    pricingText,
    plans,
    homepageUrl: home.homepageUrl,
    pricingUrl: pricingUrl ?? null,
  };

  return {
    data,
    contentHash: hashSnapshot(data),
    sourceUrls,
    fetchStatus: "ok",
    errorMessage: null,
    discoveredPricingUrl: discovered,
    suggestedName: siteName || home.title?.split(/[|\-–—]/)[0]?.trim() || null,
  };
}
