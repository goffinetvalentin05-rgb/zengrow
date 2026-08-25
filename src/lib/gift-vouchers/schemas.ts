import { z } from "zod";
import { normalizeGiftVoucherCode } from "@/src/lib/gift-vouchers/code";
import { normalizeGiftVoucherPublicToken } from "@/src/lib/gift-vouchers/public-token";
import type {
  CreateGiftVoucherInput,
  GiftVoucherStatusAction,
  RedeemGiftVoucherInput,
} from "@/src/lib/gift-vouchers/types";

export type GiftVoucherSettingsInput = {
  displayName?: string;
  offerTitle?: string;
  accentColor?: string;
  coverUrl?: string;
  terms?: string;
  footer?: string;
  includeBuyerOnPdf?: boolean;
};

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }
  return value;
}

const optionalEmail = z.preprocess(emptyToUndefined, z.string().email("E-mail invalide.").optional());
const optionalText = (max: number) => z.preprocess(emptyToUndefined, z.string().max(max).optional());

export const createGiftVoucherSchema = z
  .object({
    type: z.enum(["digital", "paper"]),
    amount: z.coerce
      .number()
      .positive("Le montant doit être supérieur à 0.")
      .max(10_000, "Le montant ne peut pas dépasser 10’000 CHF."),
    buyerName: optionalText(200),
    buyerEmail: optionalEmail,
    buyerPhone: optionalText(40),
    recipientName: optionalText(200),
    recipientEmail: optionalEmail,
    message: optionalText(2000),
    expiresAt: z.preprocess(emptyToUndefined, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date d'expiration invalide.").optional()),
    generatePdf: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.expiresAt) return;
    const expires = new Date(`${data.expiresAt}T23:59:59.000Z`);
    if (Number.isNaN(expires.getTime()) || expires.getTime() < Date.now()) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "La date d'expiration doit être dans le futur.",
      });
    }
  });

export type CreateGiftVoucherSchemaInput = z.infer<typeof createGiftVoucherSchema>;

export function parseCreateGiftVoucherInput(payload: unknown): CreateGiftVoucherInput {
  return createGiftVoucherSchema.parse(payload);
}

export const giftVoucherStatusActionSchema = z.object({
  action: z.enum(["disable", "reactivate", "mark_used", "rotate_qr"]),
});

export function parseGiftVoucherStatusAction(payload: unknown): GiftVoucherStatusAction {
  return giftVoucherStatusActionSchema.parse(payload).action;
}

export const redeemGiftVoucherSchema = z
  .object({
    code: z.preprocess(emptyToUndefined, z.string().optional()),
    voucherId: z.preprocess(emptyToUndefined, z.string().uuid("Bon cadeau introuvable.").optional()),
    amount: z.preprocess((value) => {
      if (value === "" || value === null || value === undefined) return undefined;
      if (typeof value === "string") {
        const trimmed = value.trim().replace(/\s/g, "").replace(",", ".");
        return trimmed.length === 0 ? undefined : trimmed;
      }
      return value;
    }, z.coerce.number().positive("Le montant doit être supérieur à 0.").max(10_000, "Le montant ne peut pas dépasser 10’000 CHF.").optional()),
    consumeAll: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.code && !data.voucherId) {
      ctx.addIssue({
        code: "custom",
        path: ["code"],
        message: "Indiquez le code du bon.",
      });
    }
    if (data.code && !normalizeGiftVoucherCode(data.code)) {
      ctx.addIssue({
        code: "custom",
        path: ["code"],
        message: "Ce bon n’existe pas.",
      });
    }
    if (!data.consumeAll && data.amount == null) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Le montant doit être supérieur à 0.",
      });
    }
    if (data.amount != null && Math.abs(data.amount * 100 - Math.round(data.amount * 100)) > 1e-6) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Le montant ne peut pas avoir plus de deux décimales.",
      });
    }
  });

export function parseRedeemGiftVoucherInput(payload: unknown): RedeemGiftVoucherInput {
  const parsed = redeemGiftVoucherSchema.parse(payload);
  const code = parsed.code ? (normalizeGiftVoucherCode(parsed.code) ?? undefined) : undefined;
  return {
    amount: parsed.amount,
    voucherId: parsed.voucherId,
    code,
    consumeAll: parsed.consumeAll,
  };
}

export const lookupGiftVoucherSchema = z
  .object({
    code: z.string().min(1, "Indiquez le code du bon."),
  })
  .superRefine((data, ctx) => {
    if (!normalizeGiftVoucherCode(data.code)) {
      ctx.addIssue({
        code: "custom",
        path: ["code"],
        message: "Ce bon n’existe pas.",
      });
    }
  })
  .transform((data) => normalizeGiftVoucherCode(data.code)!);

export function parseLookupGiftVoucherCode(payload: unknown): string {
  return lookupGiftVoucherSchema.parse(payload);
}

export const lookupGiftVoucherTokenSchema = z
  .object({
    token: z.string().min(1, "Ce QR code n’est pas un bon ZenGrow valide."),
  })
  .superRefine((data, ctx) => {
    if (!normalizeGiftVoucherPublicToken(data.token)) {
      ctx.addIssue({
        code: "custom",
        path: ["token"],
        message: "Ce QR code n’est pas un bon ZenGrow valide.",
      });
    }
  })
  .transform((data) => normalizeGiftVoucherPublicToken(data.token)!);

export function parseLookupGiftVoucherToken(payload: unknown): string {
  return lookupGiftVoucherTokenSchema.parse(payload);
}

export const giftVoucherSettingsSchema = z.object({
  displayName: optionalText(120),
  offerTitle: optionalText(120),
  accentColor: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Couleur invalide.")
      .optional(),
  ),
  coverUrl: optionalText(2000),
  terms: optionalText(4000),
  footer: optionalText(500),
  includeBuyerOnPdf: z.boolean().optional(),
});

export function parseGiftVoucherSettingsInput(payload: unknown): GiftVoucherSettingsInput {
  return giftVoucherSettingsSchema.parse(payload);
}
