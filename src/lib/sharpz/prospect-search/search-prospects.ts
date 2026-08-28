import type { SupabaseClient, User } from "@supabase/supabase-js";
import { runAIGeneration } from "@/src/lib/ai/route-auth";
import {
  buildProspectSearchQueries,
  parseProspectSearchCriteria,
  type SharpzSearchContext,
} from "@/src/lib/sharpz/prospect-search/criteria";
import {
  buildDedupIndex,
  isDuplicateCandidate,
  pickCanonicalWebsite,
  registerCandidate,
  shouldSkipSearchUrl,
} from "@/src/lib/sharpz/prospect-search/dedup";
import { extractProspectContact } from "@/src/lib/sharpz/prospect-search/extract-contact";
import { requireProspectSearchProvider } from "@/src/lib/sharpz/prospect-search/providers";
import { scoreProspectFit } from "@/src/lib/sharpz/prospect-search/score-fit";
import type {
  ProspectSearchResult,
  RawSearchHit,
  ScoredProspectCandidate,
} from "@/src/lib/sharpz/prospect-search/types";
import { ProspectSearchError } from "@/src/lib/sharpz/prospect-search/types";
import { getProspects } from "@/src/lib/sharpz/queries";
import type { Prospect } from "@/src/lib/sharpz/types";

import type { SubscriptionPlan, SubscriptionStatus } from "@/src/lib/subscription";

type RestaurantRow = {
  id: string;
  name: string;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  trial_end_date: string | null;
  stripe_subscription_id: string | null;
};

type SearchParams = {
  supabase: SupabaseClient;
  user: User;
  restaurant: RestaurantRow;
  userMessage: string;
  context: Awaited<ReturnType<typeof import("@/src/lib/sharpz/context").loadSharpzContext>>;
};

function uniqueHits(hits: RawSearchHit[]) {
  const seen = new Set<string>();
  const output: RawSearchHit[] = [];
  for (const hit of hits) {
    if (shouldSkipSearchUrl(hit.url)) continue;
    const canonical = pickCanonicalWebsite(hit.url);
    const key = canonical.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    output.push({ ...hit, url: canonical });
  }
  return output;
}

function locationLabel(extracted: Awaited<ReturnType<typeof extractProspectContact>>) {
  if (!extracted) return null;
  return [extracted.city, extracted.country].filter(Boolean).join(", ") || null;
}

function filterNeverContacted(prospects: Prospect[]) {
  return prospects.filter((item) => !item.contactedAt && item.status === "to_contact");
}

function buildSearchContext(
  context: SearchParams["context"],
  existingProspects: Prospect[],
): SharpzSearchContext {
  return {
    saas: context.saas
      ? {
          name: context.saas.name,
          description: context.saas.description,
          country: context.saas.country,
          market: context.saas.market,
          category: context.saas.category,
          icp: {
            clientType: context.saas.icp.clientType,
            companySize: context.saas.icp.companySize,
            industry: context.saas.icp.industry,
            location: context.saas.icp.location,
            persona: context.saas.icp.persona,
            mainProblem: context.saas.icp.mainProblem,
          },
        }
      : null,
    primaryObjective: context.primaryObjective
      ? {
          key: String(context.primaryObjective.key),
          customLabel: context.primaryObjective.customLabel,
        }
      : null,
    existingProspects: existingProspects.slice(0, 40).map((item) => ({
      company: item.company,
      url: item.url,
      status: String(item.status),
      contactedAt: item.contactedAt,
    })),
  };
}

function buildReply(
  prospects: ScoredProspectCandidate[],
  requested: number,
  duplicatesRemoved: number,
  partial: boolean,
) {
  if (!prospects.length) {
    return "Je n’ai trouvé aucun prospect vérifiable correspondant à votre demande. Essayez d’élargir la zone géographique ou le type de cible.";
  }
  const lines = [
    partial
      ? `J’ai trouvé ${prospects.length} prospect(s) vérifiable(s) sur ${requested} demandés — je n’ai pas complété avec des contacts inventés.`
      : `Voici ${prospects.length} prospect(s) trouvé(s) via une recherche web réelle.`,
  ];
  if (duplicatesRemoved > 0) {
    lines.push(`${duplicatesRemoved} doublon(s) déjà présents dans votre CRM ont été exclus.`);
  }
  lines.push("Vérifiez les fiches ci-dessous, puis ajoutez uniquement ceux que vous validez.");
  return lines.join(" ");
}

export async function searchProspects(params: SearchParams): Promise<ProspectSearchResult> {
  const provider = requireProspectSearchProvider();
  const existingProspects = await getProspects(params.supabase, params.restaurant.id);
  const searchContext = buildSearchContext(params.context, existingProspects);

  console.info("[prospect-search] start", {
    restaurantId: params.restaurant.id,
    provider: provider.name,
    message: params.userMessage.slice(0, 180),
  });

  const criteria = await runAIGeneration({
    supabase: params.supabase,
    user: params.user,
    restaurant: params.restaurant,
    feature: "sharpz_assistant",
    input: params.userMessage,
    generate: () => parseProspectSearchCriteria(params.userMessage, searchContext),
  }).then((result) => result as Awaited<ReturnType<typeof parseProspectSearchCriteria>>);

  console.info("[prospect-search] criteria", criteria);

  const queries = await runAIGeneration({
    supabase: params.supabase,
    user: params.user,
    restaurant: params.restaurant,
    feature: "sharpz_assistant",
    input: JSON.stringify(criteria),
    generate: () => buildProspectSearchQueries(criteria, searchContext),
  }).then((result) => result as string[]);

  console.info("[prospect-search] queries", queries);

  const rawHits: RawSearchHit[] = [];
  for (const query of queries) {
    try {
      const hits = await provider.search(query, 8);
      rawHits.push(...hits);
      console.info("[prospect-search] query results", query, hits.length);
    } catch (error) {
      console.error("[prospect-search] query failed", query, error);
    }
  }

  if (!rawHits.length) {
    throw new ProspectSearchError(
      "Sharpz n’a pas pu accéder à la source de recherche.",
      "provider_error",
    );
  }

  const candidates = uniqueHits(rawHits).slice(0, Math.max(criteria.count * 3, 12));
  const dedupBase = buildDedupIndex(
    criteria.onlyNeverContacted ? filterNeverContacted(existingProspects) : existingProspects,
  );

  const scored: ScoredProspectCandidate[] = [];
  let duplicatesRemoved = 0;

  for (const hit of candidates) {
    if (scored.length >= criteria.count) break;

    const extracted = await extractProspectContact(hit.url, hit.title);
    const website = extracted?.website ?? hit.url;

    const preliminary = {
      company: extracted?.officialName || hit.title,
      url: website,
      email: extracted?.email?.value ?? null,
      phone: extracted?.phone?.value ?? null,
    };

    if (isDuplicateCandidate(preliminary, dedupBase)) {
      duplicatesRemoved += 1;
      continue;
    }

    const objectiveLabel =
      searchContext.primaryObjective?.customLabel ||
      searchContext.primaryObjective?.key ||
      null;

    const fit = await runAIGeneration({
      supabase: params.supabase,
      user: params.user,
      restaurant: params.restaurant,
      feature: "sharpz_assistant",
      input: preliminary.company,
      generate: () =>
        scoreProspectFit({
          saasName: searchContext.saas?.name ?? null,
          saasDescription: searchContext.saas?.description ?? null,
          icp: searchContext.saas?.icp ?? {},
          objective: objectiveLabel,
          criteria: {
            targetDescription: criteria.targetDescription,
            industry: criteria.industry,
            location: criteria.location,
          },
          candidate: {
            ...(extracted ?? {
              officialName: hit.title,
              description: hit.snippet,
              city: null,
              country: null,
              website,
              email: null,
              phone: null,
              linkedinUrl: null,
              instagramUrl: null,
              contactPageUrl: null,
            }),
            searchTitle: hit.title,
            searchSnippet: hit.snippet,
            sourceUrl: hit.url,
          },
        }),
    }).then((result) => result as Awaited<ReturnType<typeof scoreProspectFit>>);

    const prospect: ScoredProspectCandidate = {
      company: fit.company || preliminary.company,
      name: fit.name,
      url: website,
      sourceUrl: hit.url,
      location: locationLabel(extracted),
      email: extracted?.email?.value ?? null,
      emailSourceUrl: extracted?.email?.sourceUrl ?? null,
      phone: extracted?.phone?.value ?? null,
      phoneSourceUrl: extracted?.phone?.sourceUrl ?? null,
      linkedinUrl: extracted?.linkedinUrl?.value ?? null,
      instagramUrl: extracted?.instagramUrl?.value ?? null,
      whyFit: fit.whyFit,
      fitScore: fit.fitScore,
      notes: extracted?.description?.slice(0, 500) ?? hit.snippet,
    };

    registerCandidate(prospect, dedupBase);
    scored.push(prospect);
  }

  console.info("[prospect-search] done", {
    requested: criteria.count,
    found: scored.length,
    duplicatesRemoved,
  });

  return {
    reply: buildReply(scored, criteria.count, duplicatesRemoved, scored.length < criteria.count),
    prospects: scored,
    requested: criteria.count,
    found: scored.length,
    duplicatesRemoved,
    queries,
    provider: provider.name,
  };
}
