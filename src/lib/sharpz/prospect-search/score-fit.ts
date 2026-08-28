import { z } from "zod";
import { generateStructuredAI } from "@/src/lib/ai/openai";
import type { ExtractedProspectContact } from "@/src/lib/sharpz/prospect-search/types";

const scoreSchema = z.object({
  fitScore: z.number().min(0).max(100),
  whyFit: z.string().min(1),
  company: z.string().min(1),
  name: z.string().nullable().optional(),
});

type ScoreInput = {
  saasName: string | null;
  saasDescription: string | null;
  icp: Record<string, string | null>;
  objective: string | null;
  criteria: {
    targetDescription: string;
    industry: string | null;
    location: string | null;
  };
  candidate: ExtractedProspectContact & {
    searchTitle: string;
    searchSnippet: string | null;
    sourceUrl: string;
  };
};

export async function scoreProspectFit(input: ScoreInput) {
  const { data } = await generateStructuredAI({
    system: `Tu scores le fit d'un prospect pour un fondateur SaaS.
Règles absolues :
- fitScore 0-100 : évaluation basée UNIQUEMENT sur les faits fournis (site, description, titre, snippet).
- whyFit : 1-2 phrases factuelles, sans inventer de chiffres, clients ou besoins non mentionnés.
- company : nom officiel le plus probable (depuis officialName ou searchTitle).
- name : laisser null sauf si un contact nommé est explicitement présent dans les faits.
- Si les données sont insuffisantes, score modéré (40-60) et whyFit prudent.
Réponds JSON { fitScore, whyFit, company, name? }.`,
    user: JSON.stringify(input),
    maxTokens: 400,
    timeoutMs: 12000,
    parse: (raw) => scoreSchema.parse(raw),
  });

  return {
    fitScore: Math.round(Math.min(100, Math.max(0, data.fitScore))),
    whyFit: data.whyFit.trim(),
    company: data.company.trim(),
    name: data.name?.trim() || null,
  };
}
