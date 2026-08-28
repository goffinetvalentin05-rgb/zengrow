import type { WebsiteExtract } from "@/src/lib/sharpz/types";

const PRIVATE_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const PRIVATE_IP =
  /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|127\.|0\.)/;

export class WebsiteExtractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebsiteExtractError";
  }
}

export function normalizeSaasUrl(input: string) {
  const trimmed = input.trim();
  if (!trimmed) throw new WebsiteExtractError("URL requise.");
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new WebsiteExtractError("URL invalide.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new WebsiteExtractError("Seuls http et https sont autorisés.");
  }
  const host = url.hostname.toLowerCase();
  if (PRIVATE_HOSTS.has(host) || PRIVATE_IP.test(host)) {
    throw new WebsiteExtractError("Cette URL n’est pas autorisée.");
  }
  return url.toString();
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

export async function extractWebsite(inputUrl: string): Promise<WebsiteExtract> {
  const url = normalizeSaasUrl(inputUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "SharpzBot/1.0 (+https://sharpz.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } catch {
    throw new WebsiteExtractError("Impossible d’accéder à ce site.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new WebsiteExtractError(`Le site a répondu ${response.status}.`);
  }

  const html = (await response.text()).slice(0, 400_000);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const langMatch = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  const headings = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)]
    .map((match) => stripTags(match[1] ?? ""))
    .filter(Boolean)
    .slice(0, 6);

  const title = titleMatch?.[1] ? stripTags(titleMatch[1]) : null;
  const description =
    metaContent(html, ["description", "og:description", "twitter:description"]);
  const siteName = metaContent(html, ["og:site_name", "application-name"]);
  const textSample = stripTags(html).slice(0, 4000).toLowerCase();

  const hasPricingSignals =
    /\/pricing\b|\btarif|\bpricing\b|\bprice\b|\babonnement\b|\bsubscription\b/.test(textSample) ||
    /href=["'][^"']*pricing[^"']*["']/i.test(html);
  const hasTrialSignals = /\bfree trial\b|\bessai gratuit\b|\bstart free\b|\btry free\b/.test(textSample);
  const hasFreemiumSignals = /\bfreemium\b|\bfree plan\b|\bplan gratuit\b/.test(textSample);

  return {
    url,
    finalUrl: response.url || url,
    title: title || null,
    description,
    siteName,
    language: langMatch?.[1]?.slice(0, 16) ?? null,
    headings,
    textSample: stripTags(html).slice(0, 2500),
    hasPricingSignals,
    hasTrialSignals,
    hasFreemiumSignals,
  };
}
