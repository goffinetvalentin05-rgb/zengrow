import { z } from "zod";

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

export const styleAnalysisResultSchema = z.object({
  primaryStyle: scoredStyleSchema,
  secondaryStyle: scoredStyleSchema,
  bestColors: z.array(colorItemSchema).min(3).max(8),
  lessFlatteringColors: z.array(colorItemSchema).min(2).max(6),
  notes: z.array(z.string().min(1).max(280)).min(3).max(5),
});

export type StyleAnalysisResult = z.infer<typeof styleAnalysisResultSchema>;

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
