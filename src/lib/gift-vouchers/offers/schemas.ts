import { z } from "zod";
import { clampGiftVoucherValidityMonths, DEFAULT_GIFT_VOUCHER_VALIDITY_MONTHS } from "@/src/lib/gift-vouchers/defaults";
import { chfToCents } from "@/src/lib/gift-vouchers/money";
import type {
  CreateGiftVoucherOfferInput,
  GiftVoucherOfferKind,
  GiftVoucherOfferStatus,
  UpdateGiftVoucherOfferInput,
} from "@/src/lib/gift-vouchers/offers/types";

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }
  return value;
}

function optionalText(max: number) {
  return z.preprocess(emptyToUndefined, z.string().max(max).optional());
}

const optionalChf = z.preprocess(emptyToUndefined, z.coerce.number().min(0).max(10_000).optional());

export const createGiftVoucherOfferSchema = z
  .object({
    title: z.string().trim().min(1, "Indiquez un titre.").max(120),
    shortDescription: optionalText(280),
    detailedDescription: optionalText(4000),
    imageUrl: optionalText(2000),
    kind: z.enum(["monetary", "experience"]),
    salePriceChf: optionalChf,
    faceValueChf: optionalChf,
    experienceLabel: optionalText(160),
    partySize: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).optional()),
    validityMonths: z.preprocess((value) => {
      if (value === "" || value === null || value === undefined) return undefined;
      return clampGiftVoucherValidityMonths(value);
    }, z.number().int().min(1).max(60).optional()),
    terms: optionalText(4000),
    status: z.enum(["active", "inactive"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.salePriceChf == null && data.kind === "experience") {
      return;
    }
    if (data.salePriceChf == null && data.status !== "inactive") {
      ctx.addIssue({
        code: "custom",
        path: ["salePriceChf"],
        message: "Indiquez le prix de vente.",
      });
    }
    if (data.kind === "monetary" && data.status !== "inactive") {
      const face = data.faceValueChf ?? data.salePriceChf;
      if (face == null || face <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["faceValueChf"],
          message: "Indiquez la valeur du bon en CHF.",
        });
      }
    }
  })
  .transform((data): CreateGiftVoucherOfferInput => {
    const salePriceCents = data.salePriceChf == null || data.salePriceChf === 0 ? 0 : chfToCents(data.salePriceChf);
    const faceSource = data.faceValueChf ?? (data.kind === "monetary" ? data.salePriceChf : undefined);
    const faceValueCents = faceSource != null && faceSource > 0 ? chfToCents(faceSource) : undefined;
    return {
      title: data.title.trim(),
      shortDescription: data.shortDescription,
      detailedDescription: data.detailedDescription,
      imageUrl: data.imageUrl,
      kind: data.kind as GiftVoucherOfferKind,
      salePriceCents,
      faceValueCents,
      experienceLabel:
        data.kind === "experience" ? data.experienceLabel ?? data.title.trim() : data.experienceLabel,
      partySize: data.partySize,
      validityMonths: data.validityMonths ?? DEFAULT_GIFT_VOUCHER_VALIDITY_MONTHS,
      terms: data.terms,
      status: data.status,
    };
  });

export function parseCreateGiftVoucherOfferInput(payload: unknown): CreateGiftVoucherOfferInput {
  return createGiftVoucherOfferSchema.parse(payload);
}

export const updateGiftVoucherOfferSchema = z
  .object({
    title: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(120).optional()),
    shortDescription: optionalText(280),
    detailedDescription: optionalText(4000),
    imageUrl: optionalText(2000),
    kind: z.enum(["monetary", "experience"]).optional(),
    salePriceChf: optionalChf,
    faceValueChf: optionalChf,
    experienceLabel: optionalText(160),
    partySize: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).optional()),
    validityMonths: z.preprocess((value) => {
      if (value === "" || value === null || value === undefined) return undefined;
      return clampGiftVoucherValidityMonths(value);
    }, z.number().int().min(1).max(60).optional()),
    terms: optionalText(4000),
    status: z.enum(["active", "inactive", "archived"]).optional(),
    clearImage: z.boolean().optional(),
  })
  .transform((data): UpdateGiftVoucherOfferInput & { clearImage?: boolean } => {
    const next: UpdateGiftVoucherOfferInput & { clearImage?: boolean } = {};
    if (data.title != null) next.title = data.title;
    if (data.shortDescription !== undefined) next.shortDescription = data.shortDescription;
    if (data.detailedDescription !== undefined) next.detailedDescription = data.detailedDescription;
    if (data.imageUrl !== undefined) next.imageUrl = data.imageUrl;
    if (data.kind != null) next.kind = data.kind;
    if (data.salePriceChf != null) {
      next.salePriceCents = data.salePriceChf === 0 ? 0 : chfToCents(data.salePriceChf);
    }
    if (data.faceValueChf != null && data.faceValueChf > 0) {
      next.faceValueCents = chfToCents(data.faceValueChf);
    }
    if (data.experienceLabel !== undefined) next.experienceLabel = data.experienceLabel;
    if (data.partySize !== undefined) next.partySize = data.partySize;
    if (data.validityMonths != null) next.validityMonths = data.validityMonths;
    if (data.terms !== undefined) next.terms = data.terms;
    if (data.status != null) next.status = data.status as GiftVoucherOfferStatus;
    if (data.clearImage) next.clearImage = true;
    return next;
  });

export function parseUpdateGiftVoucherOfferInput(
  payload: unknown,
): UpdateGiftVoucherOfferInput & { clearImage?: boolean } {
  return updateGiftVoucherOfferSchema.parse(payload);
}

export const reorderGiftVoucherOffersSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

export function parseReorderGiftVoucherOfferIds(payload: unknown): string[] {
  return reorderGiftVoucherOffersSchema.parse(payload).ids;
}
