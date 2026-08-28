import { z } from "zod";
import {
  DEFAULT_LOYALTY_POINTS_PER_SPEND,
  DEFAULT_LOYALTY_SIGNUP_BONUS,
  DEFAULT_LOYALTY_SPEND_AMOUNT_CENTS,
} from "@/src/lib/loyalty/points";

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) return undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  }
  return value;
}

const optionalText = (max: number) => z.preprocess(emptyToUndefined, z.string().max(max).optional());

export const createLoyaltyClientSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est obligatoire.").max(80),
  lastName: z.string().trim().min(1, "Le nom est obligatoire.").max(80),
  email: z.string().trim().email("E-mail invalide.").max(200),
  phone: optionalText(40),
});

export type CreateLoyaltyClientInput = z.infer<typeof createLoyaltyClientSchema>;

export function parseCreateLoyaltyClientInput(payload: unknown): CreateLoyaltyClientInput {
  return createLoyaltyClientSchema.parse(payload);
}

export const purchaseLoyaltySchema = z.object({
  amount: z.coerce
    .number()
    .positive("Le montant doit être supérieur à 0.")
    .max(10_000, "Le montant ne peut pas dépasser 10’000 CHF."),
});

export function parsePurchaseAmountCents(payload: unknown): number {
  const { amount } = purchaseLoyaltySchema.parse(payload);
  return Math.round(amount * 100);
}

export const redeemLoyaltySchema = z.object({
  rewardId: z.string().uuid("Récompense introuvable."),
});

export function parseRedeemLoyaltyInput(payload: unknown): { rewardId: string } {
  return redeemLoyaltySchema.parse(payload);
}

export const loyaltyRewardSchema = z.object({
  title: z.string().trim().min(1, "Le nom est obligatoire.").max(120),
  description: optionalText(500),
  pointsRequired: z.coerce
    .number()
    .int("Le nombre de points doit être un entier.")
    .positive("Le nombre de points doit être supérieur à 0.")
    .max(1_000_000, "Le palier est trop élevé."),
  active: z.boolean().optional(),
});

export type LoyaltyRewardInput = z.infer<typeof loyaltyRewardSchema>;

export function parseLoyaltyRewardInput(payload: unknown): LoyaltyRewardInput {
  return loyaltyRewardSchema.parse(payload);
}

export const patchLoyaltyRewardSchema = loyaltyRewardSchema.partial();

export function parsePatchLoyaltyRewardInput(payload: unknown): Partial<LoyaltyRewardInput> {
  return patchLoyaltyRewardSchema.parse(payload);
}

const chfToCentsField = z.coerce
  .number()
  .positive("Le montant doit être supérieur à 0.")
  .max(10_000, "Le montant ne peut pas dépasser 10’000 CHF.");

export const loyaltySettingsSchema = z.object({
  programType: z.enum(["points", "stamps"]).optional(),
  spendAmountChf: chfToCentsField.optional(),
  pointsPerSpend: z.coerce.number().int().positive().max(1000).optional(),
  signupBonusPoints: z.coerce.number().int().min(0).max(100_000).optional(),
  pointsExpiration: z.enum(["never", "months_6", "months_12"]).optional(),
});

export type LoyaltySettingsInput = {
  programType?: "points" | "stamps";
  spendAmountCents?: number;
  pointsPerSpend?: number;
  signupBonusPoints?: number;
  pointsExpiration?: "never" | "months_6" | "months_12";
};

export function parseLoyaltySettingsInput(payload: unknown): LoyaltySettingsInput {
  const parsed = loyaltySettingsSchema.parse(payload);
  const result: LoyaltySettingsInput = {};
  if (parsed.programType != null) result.programType = parsed.programType;
  if (parsed.spendAmountChf != null) {
    result.spendAmountCents = Math.round(parsed.spendAmountChf * 100);
  }
  if (parsed.pointsPerSpend != null) result.pointsPerSpend = parsed.pointsPerSpend;
  if (parsed.signupBonusPoints != null) result.signupBonusPoints = parsed.signupBonusPoints;
  if (parsed.pointsExpiration != null) result.pointsExpiration = parsed.pointsExpiration;
  return result;
}

export function defaultLoyaltySettings() {
  return {
    programType: "points" as const,
    spendAmountCents: DEFAULT_LOYALTY_SPEND_AMOUNT_CENTS,
    pointsPerSpend: DEFAULT_LOYALTY_POINTS_PER_SPEND,
    signupBonusPoints: DEFAULT_LOYALTY_SIGNUP_BONUS,
    pointsExpiration: "never" as const,
  };
}
