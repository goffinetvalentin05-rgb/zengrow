import { STYLE_PROFILE_PRICE } from "@/src/lib/fitme/constants";
import type { StyleAnalysisRow } from "@/src/lib/fitme/routing";
import type { StyleAnalysisResult } from "@/src/lib/style-analysis/schemas";
import { styleAnalysisResultSchema } from "@/src/lib/style-analysis/schemas";

export type AnalysisPublicStatus = {
  id: string;
  status: string;
  paymentStatus: string;
  isUnlocked: boolean;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
};

export type AnalysisPreview = AnalysisPublicStatus & {
  stylesIdentified: number;
  colorsSelected: number;
  looksGenerated: number;
  priceLabel: string;
};

export type UnlockedStyleProfile = AnalysisPublicStatus & {
  primaryStyle: StyleAnalysisResult["primaryStyle"];
  secondaryStyle: StyleAnalysisResult["secondaryStyle"];
  bestColors: StyleAnalysisResult["bestColors"];
  lessFlatteringColors: StyleAnalysisResult["lessFlatteringColors"];
  notes: string[];
  looks: { id: string; style: string; url: string }[];
};

export function toPublicStatus(row: StyleAnalysisRow): AnalysisPublicStatus {
  return {
    id: row.id,
    status: row.status,
    paymentStatus: row.payment_status,
    isUnlocked: row.is_unlocked && row.payment_status === "paid",
    errorMessage: row.status === "failed" ? row.error_message : null,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

export function toPreview(row: StyleAnalysisRow, looksGenerated = 0): AnalysisPreview {
  const preview = (row.preview_data ?? {}) as {
    stylesIdentified?: number;
    colorsSelected?: number;
    looksGenerated?: number;
  };

  return {
    ...toPublicStatus(row),
    stylesIdentified: preview.stylesIdentified ?? 2,
    colorsSelected: preview.colorsSelected ?? 6,
    looksGenerated: preview.looksGenerated ?? looksGenerated,
    priceLabel: STYLE_PROFILE_PRICE.label,
  };
}

export function parseStoredResult(row: StyleAnalysisRow): StyleAnalysisResult | null {
  const notesPayload = row.style_notes as { result?: unknown; notes?: unknown } | null;
  if (notesPayload && typeof notesPayload === "object" && "result" in notesPayload) {
    const fromFull = styleAnalysisResultSchema.safeParse(notesPayload.result);
    if (fromFull.success) return fromFull.data;
  }

  if (!row.primary_style || !row.secondary_style || !row.color_profile) return null;
  const colors = row.color_profile as {
    bestColors?: unknown;
    lessFlatteringColors?: unknown;
  };
  const notes = Array.isArray(notesPayload?.notes)
    ? notesPayload.notes
    : Array.isArray(row.style_notes)
      ? row.style_notes
      : [];

  const parsed = styleAnalysisResultSchema.safeParse({
    primaryStyle: {
      name: row.primary_style,
      score: Number(row.primary_style_score ?? 0),
      reason: "Selon votre profil et vos préférences.",
    },
    secondaryStyle: {
      name: row.secondary_style,
      score: Number(row.secondary_style_score ?? 0),
      reason: "Un univers complémentaire qui fonctionne bien visuellement.",
    },
    bestColors: colors.bestColors,
    lessFlatteringColors: colors.lessFlatteringColors,
    notes:
      notes.length >= 3
        ? notes
        : [
            "Palette recommandée selon votre profil visuel.",
            "Des volumes calmes vous mettent particulièrement en valeur.",
            "Un seul accent suffit pour rester cohérent.",
          ],
  });

  return parsed.success ? parsed.data : null;
}

export function isActuallyUnlocked(row: StyleAnalysisRow) {
  return row.is_unlocked === true && row.payment_status === "paid" && row.status === "completed";
}
