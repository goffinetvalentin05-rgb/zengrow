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
  primaryIdentified: boolean;
  secondaryIdentified: boolean;
  paletteReady: boolean;
  looksPending: boolean;
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

export function toPreview(row: StyleAnalysisRow): AnalysisPreview {
  return {
    ...toPublicStatus(row),
    primaryIdentified: true,
    secondaryIdentified: true,
    paletteReady: true,
    looksPending: true,
    priceLabel: STYLE_PROFILE_PRICE.label,
  };
}

export function parseStoredResult(row: StyleAnalysisRow): StyleAnalysisResult | null {
  const notesPayload = row.style_notes as { result?: unknown; notes?: unknown } | null;
  if (notesPayload && typeof notesPayload === "object" && "result" in notesPayload) {
    const fromFull = styleAnalysisResultSchema.safeParse(notesPayload.result);
    if (fromFull.success) return fromFull.data;
  }
  return null;
}

export function isFullyUnlockedProfile(row: StyleAnalysisRow) {
  return row.is_unlocked === true && row.payment_status === "paid" && row.status === "completed";
}
