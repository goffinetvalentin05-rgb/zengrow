export const GIFT_VOUCHER_TYPES = ["digital", "paper"] as const;
export const GIFT_VOUCHER_STATUSES = ["draft", "active", "used", "expired", "disabled"] as const;
export const GIFT_VOUCHER_TRANSACTION_TYPES = [
  "issued",
  "redemption",
  "adjustment",
  "refund",
  "disabled",
  "reactivated",
] as const;

export type GiftVoucherType = (typeof GIFT_VOUCHER_TYPES)[number];
export type GiftVoucherStatus = (typeof GIFT_VOUCHER_STATUSES)[number];
export type GiftVoucherTransactionType = (typeof GIFT_VOUCHER_TRANSACTION_TYPES)[number];

export type GiftVoucher = {
  id: string;
  restaurantId: string;
  buyerCustomerId: string | null;
  code: string;
  type: GiftVoucherType;
  status: GiftVoucherStatus;
  initialAmountCents: number;
  remainingAmountCents: number;
  currency: string;
  buyerName: string | null;
  buyerEmail: string | null;
  buyerPhone: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  message: string | null;
  expiresAt: string | null;
  issuedAt: string;
  fullyUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  metadata: Record<string, unknown>;
};

export type GiftVoucherTransaction = {
  id: string;
  voucherId: string;
  restaurantId: string;
  type: GiftVoucherTransactionType;
  amountCents: number | null;
  balanceBeforeCents: number | null;
  balanceAfterCents: number | null;
  note: string | null;
  createdBy: string | null;
  createdAt: string;
  metadata: Record<string, unknown>;
};

export type CreateGiftVoucherInput = {
  type: GiftVoucherType;
  amount: number;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  expiresAt?: string;
  generatePdf?: boolean;
};

export type GiftVoucherStatusAction = "disable" | "reactivate" | "mark_used";

export type RedeemGiftVoucherInput = {
  code?: string;
  voucherId?: string;
  amount: number;
};
