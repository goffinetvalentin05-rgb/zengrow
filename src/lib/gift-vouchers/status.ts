import type { GiftVoucherStatus } from "@/src/lib/gift-vouchers/types";

export type GiftVoucherBalanceState = {
  status: GiftVoucherStatus;
  remainingAmountCents: number;
  fullyUsedAt: string | null;
};

export function applyMarkUsed(nowIso: string = new Date().toISOString()): GiftVoucherBalanceState {
  return {
    status: "used",
    remainingAmountCents: 0,
    fullyUsedAt: nowIso,
  };
}

export function applyReactivate(remainingAmountCents: number): GiftVoucherStatus {
  if (remainingAmountCents <= 0) return "used";
  return "active";
}

export function canMarkUsed(status: GiftVoucherStatus, remainingAmountCents: number): boolean {
  return status === "active" && remainingAmountCents > 0;
}

export function canDisable(status: GiftVoucherStatus): boolean {
  return status === "active" || status === "draft" || status === "expired";
}

export function canReactivate(status: GiftVoucherStatus): boolean {
  return status === "disabled";
}
