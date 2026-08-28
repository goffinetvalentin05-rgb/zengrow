import { z } from "zod";
import type { ActionCategory } from "@/src/lib/sharpz/types";

const ACTION_CATEGORIES = [
  "acquisition",
  "conversion",
  "landing",
  "pricing",
  "content",
  "seo",
  "retention",
  "market",
  "prospection",
  "monetisation",
  "positioning",
] as const satisfies readonly ActionCategory[];

export const searchProspectsInputSchema = z.object({
  query: z.string().min(3).max(500).describe("Critères de recherche en langage naturel"),
  count: z.number().int().min(1).max(10).optional().default(5),
});

export const createActionInputSchema = z.object({
  title: z.string().min(3).max(200),
  category: z.enum(ACTION_CATEGORIES).optional().default("acquisition"),
  impact: z.number().min(1).max(10).optional().default(7),
  effort: z.number().min(1).max(10).optional().default(5),
  confidence: z.number().min(0).max(100).optional().default(70),
  why: z.string().max(2000).optional(),
  howTo: z.string().max(4000).optional(),
  objectiveKey: z.string().max(40).nullable().optional(),
});

export const scheduleFollowupInputSchema = z
  .object({
    prospectId: z.string().uuid().optional(),
    company: z.string().min(1).max(200).optional(),
    daysFromNow: z.number().int().min(1).max(90).optional().default(7),
    note: z.string().max(500).optional(),
  })
  .refine((value) => Boolean(value.prospectId || value.company?.trim()), {
    message: "prospectId ou company requis.",
  });

export const analyzeTrafficInputSchema = z.object({
  periodDays: z.number().int().min(1).max(90).optional().default(7),
});

export const createExperimentInputSchema = z.object({
  hypothesis: z.string().min(5).max(2000),
  title: z.string().max(200).optional(),
  actionId: z.string().uuid().nullable().optional(),
  actionDescription: z.string().max(2000).nullable().optional(),
  metric: z
    .enum([
      "visitors_7d",
      "pageviews_7d",
      "sessions_7d",
      "prospects_customers",
      "prospects_qualified",
      "mrr",
    ])
    .optional(),
  plannedDays: z.number().int().min(1).max(90).optional(),
});

export const searchCompetitorsInputSchema = z.object({
  query: z.string().min(3).max(500).optional(),
  count: z.number().int().min(1).max(10).optional().default(5),
});

export const analyzeCompetitorChangesInputSchema = z.object({
  days: z.number().int().min(1).max(90).optional().default(14),
  competitorName: z.string().max(200).optional(),
});

export const createCompetitorInputSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url().max(500),
  whyCompetitor: z.string().max(1000).nullable().optional(),
  sourceUrl: z.string().url().max(500).nullable().optional(),
});

export const createProspectInputSchema = z.object({
  company: z.string().min(1).max(200),
  name: z.string().max(200).nullable().optional(),
  url: z.string().url().max(500).nullable().optional(),
  email: z.string().email().max(200).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  contact: z.string().max(200).nullable().optional(),
  whyFit: z.string().max(2000).nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
});

export type SearchProspectsInput = z.infer<typeof searchProspectsInputSchema>;
export type CreateActionInput = z.infer<typeof createActionInputSchema>;
export type ScheduleFollowupInput = z.infer<typeof scheduleFollowupInputSchema>;
export type AnalyzeTrafficInput = z.infer<typeof analyzeTrafficInputSchema>;
export type CreateExperimentInput = z.infer<typeof createExperimentInputSchema>;
export type SearchCompetitorsInput = z.infer<typeof searchCompetitorsInputSchema>;
export type AnalyzeCompetitorChangesInput = z.infer<typeof analyzeCompetitorChangesInputSchema>;
export type CreateCompetitorInput = z.infer<typeof createCompetitorInputSchema>;
export type CreateProspectInput = z.infer<typeof createProspectInputSchema>;

export function parseToolInput<T>(schema: z.ZodType<T>, raw: unknown): { ok: true; data: T } | { ok: false; error: string } {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("; ") || "Arguments invalides.";
    return { ok: false, error: message };
  }
  return { ok: true, data: parsed.data };
}

/** Rejette tout restaurant_id / user_id fourni par le modèle. */
export function stripServerOnlyFields(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const copy = { ...(raw as Record<string, unknown>) };
  delete copy.restaurant_id;
  delete copy.restaurantId;
  delete copy.user_id;
  delete copy.userId;
  return copy;
}
