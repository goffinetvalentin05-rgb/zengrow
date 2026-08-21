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
  portraitUrl: string | null;
  photos: { type: string; url: string; storagePath: string }[];
  looksGeneratedCount: number;
};

export type AnalysisPreview = AnalysisPublicStatus & {
  primaryIdentified: boolean;
  secondaryIdentified: boolean;
  paletteReady: boolean;
  looksPending: boolean;
  revealedColors: { hex: string }[];
  lockedColorSlots: number;
  lookSlots: number;
  priceLabel: string;
};

export type UnlockedStyleProfile = AnalysisPublicStatus & {
  firstName: string | null;
  primaryStyle: StyleAnalysisResult["primaryStyle"];
  secondaryStyle: StyleAnalysisResult["secondaryStyle"];
  bestColors: StyleAnalysisResult["bestColors"];
  lessFlatteringColors: StyleAnalysisResult["lessFlatteringColors"];
  notes: string[];
  looks: { id: string; style: string; url: string }[];
};

export function toPublicStatus(
  row: StyleAnalysisRow,
  extras?: {
    portraitUrl?: string | null;
    photos?: AnalysisPublicStatus["photos"];
    looksGeneratedCount?: number;
  },
): AnalysisPublicStatus {
  return {
    id: row.id,
    status: row.status,
    paymentStatus: row.payment_status,
    isUnlocked: row.is_unlocked && row.payment_status === "paid",
    errorMessage: row.status === "failed" ? row.error_message : null,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    portraitUrl: extras?.portraitUrl ?? null,
    photos: extras?.photos ?? [],
    looksGeneratedCount: extras?.looksGeneratedCount ?? 0,
  };
}

export function toPreview(
  row: StyleAnalysisRow,
  extras?: {
    portraitUrl?: string | null;
    photos?: AnalysisPublicStatus["photos"];
  },
): AnalysisPreview {
  const result = parseStoredResult(row);
  const revealedColors = (result?.bestColors ?? []).slice(0, 2).map((color) => ({ hex: color.hex }));
  return {
    ...toPublicStatus(row, extras),
    primaryIdentified: Boolean(result) || row.status === "preview_ready" || row.status === "awaiting_payment",
    secondaryIdentified: Boolean(result) || row.status === "preview_ready" || row.status === "awaiting_payment",
    paletteReady: Boolean(result) || row.status === "preview_ready" || row.status === "awaiting_payment",
    looksPending: true,
    revealedColors,
    lockedColorSlots: Math.max(0, 6 - revealedColors.length),
    lookSlots: 3,
    priceLabel: STYLE_PROFILE_PRICE.label,
  };
}

export function parseStoredResult(row: Pick<StyleAnalysisRow, "style_notes">): StyleAnalysisResult | null {
  const notesPayload = row.style_notes as { result?: unknown; notes?: unknown } | null;
  if (notesPayload && typeof notesPayload === "object" && "result" in notesPayload) {
    const fromFull = styleAnalysisResultSchema.safeParse(notesPayload.result);
    if (fromFull.success) return fromFull.data;
  }
  return null;
}

export function isFullyUnlockedProfile(row: Pick<StyleAnalysisRow, "is_unlocked" | "payment_status" | "status">) {
  return row.is_unlocked === true && row.payment_status === "paid" && row.status === "completed";
}

export function previewLeaksResult(payload: unknown) {
  const text = JSON.stringify(payload).toLowerCase();
  return (
    text.includes("primarystyle") ||
    text.includes("secondarystyle") ||
    text.includes("bestcolors") ||
    text.includes("stylenotes") ||
    text.includes("lessflattering")
  );
}
