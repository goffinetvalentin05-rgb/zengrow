import { z } from "zod";
import { canonicalizeStyleName } from "@/src/lib/style-analysis/taxonomy";

export const styleNameSchema = z.string().min(1).max(80);

export const scoredStyleSchema = z.object({
  name: styleNameSchema,
  score: z.number().min(0).max(100),
  reason: z.string().min(1).max(400),
});

export const colorItemSchema = z.object({
  name: z.string().min(1).max(60),
  hex: z.string().regex(/^#([0-9A-Fa-f]{6})$/),
  reason: z.string().min(1).max(240),
});

const styleAnalysisResultObjectSchema = z.object({
  primaryStyle: scoredStyleSchema,
  secondaryStyle: scoredStyleSchema,
  bestColors: z.array(colorItemSchema).min(5).max(8),
  lessFlatteringColors: z.array(colorItemSchema).min(3).max(4),
  notes: z.array(z.string().min(1).max(280)).min(3).max(5),
  summary: z.string().min(1).max(400),
  strengths: z.array(z.string().min(1).max(180)).min(2).max(5),
  stylingNotes: z.array(z.string().min(1).max(280)).min(3).max(6),
  recommendedPieces: z.array(z.string().min(1).max(80)).min(3).max(8),
  avoidOrLimit: z.array(z.string().min(1).max(180)).min(2).max(6),
  confidence: z.number().min(0).max(100),
});

export const styleAnalysisResultSchema = z.preprocess(
  normalizeStyleAnalysisPayload,
  styleAnalysisResultObjectSchema,
);

export type StyleAnalysisResult = z.infer<typeof styleAnalysisResultObjectSchema>;

export const generatedImageMetaSchema = z.object({
  title: z.string().min(1).max(80),
  style: styleNameSchema,
  description: z.string().min(1).max(280),
  pieces: z.array(z.string().min(1).max(80)).min(2).max(6),
  colors: z.array(z.string().regex(/^#([0-9A-Fa-f]{6})$/)).min(2).max(4),
  storagePath: z.string().min(8).max(400).optional().nullable(),
});

export type GeneratedImageMeta = z.infer<typeof generatedImageMetaSchema>;

export const stylePreferencesSchema = z.object({
  firstName: z.string().trim().max(60).optional().nullable(),
  presentation: z.enum(["femme", "homme", "neutre"]).optional().nullable(),
  ageRange: z.enum(["18-24", "25-34", "35-44", "45-54", "55+"]).optional().nullable(),
  universes: z.array(z.string().min(1).max(40)).max(3).default([]),
  goal: z.string().max(80).optional().nullable(),
});

export type StylePreferences = z.infer<typeof stylePreferencesSchema>;

export const createAnalysisSchema = z.object({
  preferences: stylePreferencesSchema.optional(),
});

export const confirmImagesSchema = z.object({
  images: z
    .array(
      z.object({
        type: z.enum(["portrait", "full_body", "extra"]),
        storagePath: z.string().min(8).max(400),
      }),
    )
    .min(2)
    .max(4),
});

export const checkoutSchema = z.object({
  analysisId: z.string().uuid(),
});

export const startAnalysisSchema = z.object({
  analysisId: z.string().uuid(),
});

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function pick(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
  }
  return undefined;
}

export function normalizeHex(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  let hex = value.trim();
  if (!hex) return undefined;
  if (!hex.startsWith("#")) hex = `#${hex}`;
  if (/^#[0-9A-Fa-f]{3}$/.test(hex)) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return undefined;
  return hex.toUpperCase();
}

function clampScore(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number.parseFloat(value) : Number.NaN;
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeScoredStyle(value: unknown) {
  const record = asRecord(value);
  if (!record) return value;
  const nameRaw = pick(record, "name", "label");
  const score = clampScore(pick(record, "score", "match"));
  const reason = pick(record, "reason", "why");
  return {
    name: typeof nameRaw === "string" ? canonicalizeStyleName(nameRaw) : nameRaw,
    score,
    reason: typeof reason === "string" ? reason.trim() : reason,
  };
}

function normalizeColorItem(value: unknown) {
  const record = asRecord(value);
  if (!record) return value;
  return {
    name: pick(record, "name", "label"),
    hex: normalizeHex(pick(record, "hex", "color")) ?? pick(record, "hex"),
    reason: pick(record, "reason", "why"),
  };
}

function stringList(value: unknown, maxItem = 280): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.slice(0, maxItem));
}

export function normalizeStyleAnalysisPayload(value: unknown): unknown {
  const record = asRecord(value);
  if (!record) return value;

  const primaryStyle = normalizeScoredStyle(pick(record, "primaryStyle", "primary_style"));
  const secondaryStyle = normalizeScoredStyle(pick(record, "secondaryStyle", "secondary_style"));
  const bestColors = (Array.isArray(pick(record, "bestColors", "best_colors"))
    ? (pick(record, "bestColors", "best_colors") as unknown[])
    : []
  ).map(normalizeColorItem);
  const lessFlatteringColors = (Array.isArray(pick(record, "lessFlatteringColors", "less_flattering_colors"))
    ? (pick(record, "lessFlatteringColors", "less_flattering_colors") as unknown[])
    : []
  ).map(normalizeColorItem);

  const stylingNotes = stringList(pick(record, "stylingNotes", "styling_notes", "notes"));
  const notes = stringList(pick(record, "notes", "stylingNotes", "styling_notes"));
  const recommendedPieces = stringList(pick(record, "recommendedPieces", "recommended_pieces"), 80);

  return {
    primaryStyle,
    secondaryStyle,
    bestColors,
    lessFlatteringColors,
    notes: (notes.length ? notes : stylingNotes).slice(0, 5),
    summary: pick(record, "summary", "overview"),
    strengths: stringList(pick(record, "strengths"), 180).slice(0, 5),
    stylingNotes: (stylingNotes.length ? stylingNotes : notes).slice(0, 6),
    recommendedPieces: recommendedPieces.slice(0, 8),
    avoidOrLimit: stringList(pick(record, "avoidOrLimit", "avoid_or_limit"), 180).slice(0, 6),
    confidence: clampScore(pick(record, "confidence")) ?? 78,
  };
}
