import { z } from "zod";
import { generateStructuredAI } from "@/src/lib/ai/openai";
import type { ProspectSearchCriteria } from "@/src/lib/sharpz/prospect-search/types";

const criteriaSchema = z.object({
  count: z.number().int().min(1).max(10).default(5),
  targetDescription: z.string().min(1),
  industry: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  keywords: z.array(z.string()).max(8).default([]),
  exclusions: z.array(z.string()).max(8).default([]),
  referenceCompany: z.string().nullable().optional(),
  onlyNeverContacted: z.boolean().default(false),
});

const querySchema = z.object({
  queries: z.array(z.string().min(3)).min(1).max(6),
});

type SharpzSearchContext = {
  saas: {
    name: string | null;
    description: string | null;
    country: string | null;
    market: string | null;
    category: string | null;
    icp: Record<string, string | null>;
  } | null;
  primaryObjective: { key: string; customLabel: string | null } | null;
  existingProspects: Array<{ company: string; url: string | null; status: string; contactedAt: string | null }>;
};

export async function parseProspectSearchCriteria(userMessage: string, context: SharpzSearchContext) {
  const { data } = await generateStructuredAI({
    system: `Tu extrais les critères de recherche de prospects pour Sharpz.
Règles :
- Utilise l'ICP et le profil SaaS si la demande est vague ("5 prospects", "prospects cohérents avec mon ICP").
- Utilise les critères explicites de l'utilisateur s'ils sont plus précis (ex: "10 restaurants à Lausanne").
- count : nombre demandé (défaut 5, max 10). Extrais "5", "dix", etc.
- onlyNeverContacted : true si l'utilisateur veut des prospects jamais contactés / pas encore dans le CRM actif.
- referenceCompany : nom d'un prospect de référence si "similaires à X".
- N'invente pas de localisation ou secteur absents du message ET du contexte.
Réponds en JSON.`,
    user: JSON.stringify({ userMessage, context }),
    maxTokens: 700,
    timeoutMs: 15000,
    parse: (raw) => criteriaSchema.parse(raw),
  });

  return {
    count: data.count,
    targetDescription: data.targetDescription.trim(),
    industry: data.industry?.trim() || context.saas?.icp?.industry || context.saas?.category || null,
    location:
      data.location?.trim() ||
      context.saas?.icp?.location ||
      context.saas?.country ||
      context.saas?.market ||
      null,
    keywords: data.keywords.map((item) => item.trim()).filter(Boolean),
    exclusions: data.exclusions.map((item) => item.trim()).filter(Boolean),
    referenceCompany: data.referenceCompany?.trim() || null,
    onlyNeverContacted: data.onlyNeverContacted,
  } satisfies ProspectSearchCriteria;
}

export async function buildProspectSearchQueries(
  criteria: ProspectSearchCriteria,
  context: SharpzSearchContext,
) {
  const { data } = await generateStructuredAI({
    system: `Tu génères des requêtes de recherche web pour trouver de VRAIES entreprises/organisations.
Règles :
- 3 à 6 requêtes courtes, en français ou langue du marché cible.
- Varie les formulations (ville, région, type d'organisation).
- Cible des sites officiels d'entreprises/clubs/organisations, pas des listicles génériques.
- Si location/industry connus, les inclure.
- Pas de LinkedIn scraping queries.
Réponds JSON { "queries": string[] }.`,
    user: JSON.stringify({ criteria, saasName: context.saas?.name, icp: context.saas?.icp }),
    maxTokens: 500,
    timeoutMs: 15000,
    parse: (raw) => querySchema.parse(raw),
  });

  return data.queries.map((item) => item.trim()).filter(Boolean).slice(0, 6);
}

export type { SharpzSearchContext };
