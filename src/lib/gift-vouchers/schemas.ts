import { z } from "zod";
import type { CreateGiftVoucherInput, GiftVoucherStatusAction } from "@/src/lib/gift-vouchers/types";

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
  action: z.enum(["disable", "reactivate", "mark_used"]),
});

export function parseGiftVoucherStatusAction(payload: unknown): GiftVoucherStatusAction {
  return giftVoucherStatusActionSchema.parse(payload).action;
}
