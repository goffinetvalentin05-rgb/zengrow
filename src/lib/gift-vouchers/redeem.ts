import type { GiftVoucherStatus } from "@/src/lib/gift-vouchers/types";

export type RedeemBlockReason = "not_found" | "used" | "expired" | "disabled" | "draft";
export type RedeemRpcError =
  | RedeemBlockReason
  | "not_authorized"
  | "invalid_amount"
  | "insufficient_balance";

export const REDEEM_ERROR_MESSAGES: Record<RedeemRpcError, string> = {
  not_found: "Ce bon n’existe pas.",
  used: "Ce bon a déjà été utilisé.",
  expired: "Ce bon est expiré.",
  disabled: "Ce bon est désactivé.",
  draft: "Ce bon n’est pas encore actif.",
  not_authorized: "Non autorisé.",
  invalid_amount: "Le montant doit être supérieur à 0.",
  insufficient_balance: "Le montant dépasse le solde restant.",
};

export function redeemErrorMessage(code: string): string {
  if (code in REDEEM_ERROR_MESSAGES) {
    return REDEEM_ERROR_MESSAGES[code as RedeemRpcError];
  }
  return "Impossible d’utiliser ce bon.";
}

export function isGiftVoucherExpired(expiresAt: string | null, now: Date = new Date()): boolean {
  if (!expiresAt) return false;
  const time = new Date(expiresAt).getTime();
  return !Number.isNaN(time) && time < now.getTime();
}

export function getRedeemBlockReason(
  voucher: {
    status: GiftVoucherStatus;
    remainingAmountCents: number;
    expiresAt: string | null;
  },
  now: Date = new Date(),
): RedeemBlockReason | null {
  if (voucher.status === "draft") return "draft";
  if (voucher.status === "disabled") return "disabled";
  if (voucher.status === "used" || voucher.remainingAmountCents <= 0) return "used";
  if (voucher.status === "expired" || isGiftVoucherExpired(voucher.expiresAt, now)) return "expired";
  if (voucher.status !== "active") return "not_found";
  return null;
}

export function canRedeem(
  status: GiftVoucherStatus,
  remainingAmountCents: number,
  expiresAt: string | null,
  now: Date = new Date(),
): boolean {
  return getRedeemBlockReason({ status, remainingAmountCents, expiresAt }, now) == null;
}

export type RedeemResult = {
  remainingAmountCents: number;
  status: "active" | "used";
  fullyUsedAt: string | null;
};

export function applyRedeem(
  remainingAmountCents: number,
  amountCents: number,
  nowIso: string = new Date().toISOString(),
): RedeemResult {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error(REDEEM_ERROR_MESSAGES.invalid_amount);
  }
  if (!Number.isInteger(remainingAmountCents) || remainingAmountCents <= 0) {
    throw new Error(REDEEM_ERROR_MESSAGES.used);
  }
  if (amountCents > remainingAmountCents) {
    throw new Error(REDEEM_ERROR_MESSAGES.insufficient_balance);
  }

  const next = remainingAmountCents - amountCents;
  if (next === 0) {
    return { remainingAmountCents: 0, status: "used", fullyUsedAt: nowIso };
  }
  return { remainingAmountCents: next, status: "active", fullyUsedAt: null };
}
