import { STYLE_PROFILE_PRICE } from "@/src/lib/fitme/constants";
import type { StyleAnalysisRow } from "@/src/lib/fitme/routing";
import type { GeneratedImageMeta, StyleAnalysisResult } from "@/src/lib/style-analysis/schemas";
import { generatedImageMetaSchema, styleAnalysisResultSchema } from "@/src/lib/style-analysis/schemas";

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
  imagePending: boolean;
  primaryStyleName: string | null;
  primaryStyleScore: number | null;
  secondaryStyleName: string | null;
  confidence: number | null;
  teaserSummary: string | null;
  revealedColors: { hex: string }[];
  lockedColorSlots: number;
  priceLabel: string;
};

export type UnlockedGeneratedImage = {
  id: string;
  url: string;
  title: string;
  style: string;
  description: string;
  pieces: string[];
  colors: string[];
};

export type UnlockedStyleProfile = AnalysisPublicStatus & {
  firstName: string | null;
  primaryStyle: StyleAnalysisResult["primaryStyle"];
  secondaryStyle: StyleAnalysisResult["secondaryStyle"];
  bestColors: StyleAnalysisResult["bestColors"];
  lessFlatteringColors: StyleAnalysisResult["lessFlatteringColors"];
  notes: string[];
  summary: string;
  strengths: string[];
  stylingNotes: string[];
  recommendedPieces: string[];
  avoidOrLimit: string[];
  confidence: number;
  generatedImage: UnlockedGeneratedImage | null;
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

function teaserSummary(summary: string | undefined) {
  if (!summary) return null;
  const trimmed = summary.trim();
  if (trimmed.length <= 160) return trimmed;
  return `${trimmed.slice(0, 157).trimEnd()}…`;
}

export function toPreview(
  row: StyleAnalysisRow,
  extras?: {
    portraitUrl?: string | null;
    photos?: AnalysisPublicStatus["photos"];
  },
): AnalysisPreview {
  const result = parseStoredResult(row);
  const revealedColors = (result?.bestColors ?? []).slice(0, 3).map((color) => ({ hex: color.hex }));
  return {
    ...toPublicStatus(row, extras),
    primaryIdentified: Boolean(result) || row.status === "preview_ready" || row.status === "awaiting_payment",
    secondaryIdentified: Boolean(result) || row.status === "preview_ready" || row.status === "awaiting_payment",
    paletteReady: Boolean(result) || row.status === "preview_ready" || row.status === "awaiting_payment",
    imagePending: true,
    primaryStyleName: result?.primaryStyle.name ?? null,
    primaryStyleScore: result?.primaryStyle.score ?? null,
    secondaryStyleName: result?.secondaryStyle.name ?? null,
    confidence: result?.confidence ?? null,
    teaserSummary: teaserSummary(result?.summary),
    revealedColors,
    lockedColorSlots: Math.max(0, 6 - revealedColors.length),
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

export function parseStoredGeneratedImage(row: Pick<StyleAnalysisRow, "style_notes">): GeneratedImageMeta | null {
  const notesPayload = row.style_notes as { generatedImage?: unknown; looks?: unknown } | null;
  if (!notesPayload || typeof notesPayload !== "object") return null;

  const direct = generatedImageMetaSchema.safeParse(notesPayload.generatedImage);
  if (direct.success) return direct.data;

  if (Array.isArray(notesPayload.looks) && notesPayload.looks[0]) {
    const legacy = generatedImageMetaSchema.safeParse(notesPayload.looks[0]);
    if (legacy.success) return legacy.data;
  }

  return null;
}

export function isFullyUnlockedProfile(row: Pick<StyleAnalysisRow, "is_unlocked" | "payment_status" | "status">) {
  return row.is_unlocked === true && row.payment_status === "paid" && row.status === "completed";
}

export function previewLeaksResult(payload: unknown) {
  if (!payload || typeof payload !== "object") return false;
  const record = payload as Record<string, unknown>;
  const leakedKeys = [
    "bestColors",
    "lessFlatteringColors",
    "stylingNotes",
    "recommendedPieces",
    "avoidOrLimit",
    "lookBriefs",
    "secondaryStyle",
    "generatedImage",
    "notes",
    "strengths",
  ];
  return leakedKeys.some((key) => key in record);
}
