import { z } from "zod";
import { generateStructuredAI } from "@/src/lib/ai/openai";
import { EMPTY_ICP, type BusinessModel, type BillingType, type IcpProfile, type ScanResult, type WebsiteExtract } from "@/src/lib/sharpz/types";

const optionalText = z.union([z.string().min(1), z.null()]).optional();

const scanSchema = z.object({
  name: optionalText,
  description: optionalText,
  category: optionalText,
  country: optionalText,
  market: optionalText,
  language: optionalText,
  businessModel: z.union([z.enum(["b2b", "b2c", "both"]), z.null()]).optional(),
  pricingSummary: optionalText,
  billingType: z.union([z.enum(["subscription", "one_shot", "both"]), z.null()]).optional(),
  hasFreemium: z.union([z.boolean(), z.null()]).optional(),
  hasTrial: z.union([z.boolean(), z.null()]).optional(),
  icp: z
    .object({
      clientType: optionalText,
      companySize: optionalText,
      industry: optionalText,
      location: optionalText,
      persona: optionalText,
      mainProblem: optionalText,
    })
    .optional(),
});

function clean(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function icpFromUnknown(value: ScanResult["detected"]["icp"] | undefined): IcpProfile {
  return {
    clientType: clean(value?.clientType) ,
    companySize: clean(value?.companySize),
    industry: clean(value?.industry),
    location: clean(value?.location),
    persona: clean(value?.persona),
    mainProblem: clean(value?.mainProblem),
  };
}

function collectUnknownFields(detected: ScanResult["detected"], extract: WebsiteExtract): string[] {
  const unknown: string[] = [];
  if (!detected.name) unknown.push("name");
  if (!detected.description) unknown.push("description");
  if (!detected.category) unknown.push("category");
  if (!detected.country) unknown.push("country");
  if (!detected.market) unknown.push("market");
  if (!detected.language) unknown.push("language");
  if (!detected.businessModel) unknown.push("businessModel");
  if (!detected.pricingSummary) unknown.push("pricing");
  if (!detected.billingType) unknown.push("billingType");
  if (detected.hasFreemium == null && !extract.hasFreemiumSignals) unknown.push("freemium");
  if (detected.hasTrial == null && !extract.hasTrialSignals) unknown.push("trial");
  if (!detected.icp.clientType) unknown.push("icp.clientType");
  if (!detected.icp.companySize) unknown.push("icp.companySize");
  if (!detected.icp.industry) unknown.push("icp.industry");
  if (!detected.icp.location) unknown.push("icp.location");
  if (!detected.icp.persona) unknown.push("icp.persona");
  if (!detected.icp.mainProblem) unknown.push("icp.mainProblem");
  return unknown;
}

export function scanFromExtractOnly(extract: WebsiteExtract): ScanResult {
  const name = extract.siteName || extract.title;
  const language = extract.language ? extract.language.slice(0, 2).toLowerCase() : null;
  const detected: ScanResult["detected"] = {
    name: clean(name),
    description: clean(extract.description),
    category: null,
    country: null,
    market: null,
    language,
    businessModel: null,
    pricingSummary: null,
    billingType: null,
    hasFreemium: extract.hasFreemiumSignals ? true : null,
    hasTrial: extract.hasTrialSignals ? true : null,
    icp: { ...EMPTY_ICP },
  };
  return {
    enrichmentSource: "extract_only",
    extract,
    detected,
    unknownFields: collectUnknownFields(detected, extract),
  };
}

export async function enrichScanWithAI(extract: WebsiteExtract): Promise<ScanResult> {
  const fallback = scanFromExtractOnly(extract);
  const { data } = await generateStructuredAI({
      system: `Tu extrais des faits depuis un extrait HTML de site SaaS.
Règles STRICTES:
- N'invente jamais.
- Si une information n'est pas clairement supportée par l'extrait, renvoie null.
- businessModel seulement si clairement B2B, B2C ou les deux.
- pricingSummary seulement si un prix ou une offre est explicitement visible.
Réponds en JSON.`,
      user: JSON.stringify({
        url: extract.finalUrl,
        title: extract.title,
        description: extract.description,
        siteName: extract.siteName,
        language: extract.language,
        headings: extract.headings,
        textSample: extract.textSample,
        signals: {
          pricing: extract.hasPricingSignals,
          trial: extract.hasTrialSignals,
          freemium: extract.hasFreemiumSignals,
        },
      }),
      maxTokens: 1200,
      timeoutMs: 12000,
      parse: (raw) => scanSchema.parse(raw),
    });

    const icp = icpFromUnknown({
      clientType: data.icp?.clientType ?? null,
      companySize: data.icp?.companySize ?? null,
      industry: data.icp?.industry ?? null,
      location: data.icp?.location ?? null,
      persona: data.icp?.persona ?? null,
      mainProblem: data.icp?.mainProblem ?? null,
    });

    const detected: ScanResult["detected"] = {
      name: clean(data.name) ?? fallback.detected.name,
      description: clean(data.description) ?? fallback.detected.description,
      category: clean(data.category),
      country: clean(data.country),
      market: clean(data.market),
      language: clean(data.language) ?? fallback.detected.language,
      businessModel: (data.businessModel as BusinessModel | null | undefined) ?? null,
      pricingSummary: clean(data.pricingSummary),
      billingType: (data.billingType as BillingType | null | undefined) ?? null,
      hasFreemium: data.hasFreemium ?? fallback.detected.hasFreemium,
      hasTrial: data.hasTrial ?? fallback.detected.hasTrial,
      icp,
    };

  return {
    enrichmentSource: "openai",
    extract,
    detected,
    unknownFields: collectUnknownFields(detected, extract),
  };
}
