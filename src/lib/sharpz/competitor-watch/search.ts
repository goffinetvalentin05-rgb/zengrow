import type { SharpzAgentContext } from "@/src/lib/sharpz/agent-tools/types";
import { isProspectSearchConfigured, requireProspectSearchProvider } from "@/src/lib/sharpz/prospect-search/providers";
import { ProspectSearchError } from "@/src/lib/sharpz/prospect-search/types";
import { normalizeSaasUrl, WebsiteExtractError } from "@/src/lib/sharpz/website-extract";

export type CompetitorSearchCandidate = {
  companyName: string;
  website: string;
  whyCompetitor: string;
  sourceUrl: string;
  confidence: number;
};

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function cleanCompanyName(title: string, host: string | null): string {
  const trimmed = title
    .split(/[|\-–—·]/)[0]
    ?.replace(/\s+(pricing|tarifs?|home|accueil).*$/i, "")
    .trim();
  if (trimmed && trimmed.length >= 2 && trimmed.length <= 80) return trimmed;
  if (host) {
    const base = host.split(".")[0] ?? host;
    return base.charAt(0).toUpperCase() + base.slice(1);
  }
  return title.slice(0, 80);
}

/**
 * Recherche web réelle de concurrents (même providers que Prospects).
 * Aucune entreprise inventée — uniquement des hits avec URL.
 */
export async function searchCompetitorsWeb(input: {
  context: SharpzAgentContext;
  query?: string | null;
  count?: number;
}): Promise<{
  competitors: CompetitorSearchCandidate[];
  queries: string[];
  provider: string;
}> {
  if (!isProspectSearchConfigured()) {
    throw new ProspectSearchError(
      "Recherche web non configurée (Tavily / Serper / Brave).",
      "not_configured",
      false,
    );
  }

  const count = Math.min(Math.max(input.count ?? 5, 1), 10);
  const saas = input.context.saas;
  const ownHosts = new Set<string>();
  if (saas?.url) {
    const h = hostOf(saas.url);
    if (h) ownHosts.add(h);
  }

  const knownHosts = new Set(
    input.context.competitors
      .map((c) => (c.url ? hostOf(c.url) : null))
      .filter((h): h is string => Boolean(h)),
  );

  const icpLabel =
    typeof saas?.icp === "object" && saas.icp
      ? [saas.icp.persona, saas.icp.industry, saas.icp.mainProblem].filter(Boolean).join(" ")
      : null;

  const baseQuery =
    input.query?.trim() ||
    [
      saas?.name ? `alternatives to ${saas.name}` : null,
      saas?.description ? `competitors ${saas.description.slice(0, 120)}` : null,
      saas?.market ? `${saas.market} SaaS competitors` : null,
      "SaaS competitors",
    ]
      .filter(Boolean)
      .join(" ");

  const queries = [
    baseQuery,
    saas?.name ? `${saas.name} vs competitors` : null,
    icpLabel ? `tools for ${icpLabel} competitors` : null,
  ].filter((q): q is string => Boolean(q?.trim()));

  const provider = requireProspectSearchProvider();
  const hits = [];
  for (const q of queries.slice(0, 3)) {
    try {
      const batch = await provider.search(q, Math.min(count + 3, 10));
      hits.push(...batch);
    } catch (error) {
      console.error("[search-competitors]", q, error);
    }
  }

  const candidates: CompetitorSearchCandidate[] = [];
  const seenHosts = new Set<string>();

  for (const hit of hits) {
    if (candidates.length >= count) break;
    let website: string;
    try {
      website = normalizeSaasUrl(hit.url);
    } catch {
      continue;
    }
    const host = hostOf(website);
    if (!host || ownHosts.has(host) || knownHosts.has(host) || seenHosts.has(host)) continue;
    // Skip LinkedIn / social — pas de scraping LinkedIn
    if (/linkedin\.com|facebook\.com|twitter\.com|x\.com|instagram\.com|youtube\.com/i.test(host)) {
      continue;
    }
    seenHosts.add(host);

    const companyName = cleanCompanyName(hit.title || host, host);
    const why =
      hit.snippet?.trim().slice(0, 280) ||
      `Résultat web pour « ${hit.sourceQuery} » — à valider avant ajout.`;

    candidates.push({
      companyName,
      website,
      whyCompetitor: why,
      sourceUrl: hit.url,
      confidence: hit.snippet ? 65 : 45,
    });
  }

  return { competitors: candidates, queries, provider: provider.name };
}

export { WebsiteExtractError, ProspectSearchError };
