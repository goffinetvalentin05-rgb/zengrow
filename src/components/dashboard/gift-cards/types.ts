export type GiftCardType = "digital" | "paper";
export type GiftCardStatus = "active" | "used" | "expired" | "disabled";

export type GiftCardUsageEvent = {
  id: string;
  dateLabel: string;
  amountUsedChf: number;
  remainingBalanceChf: number;
};

export type GiftCardRecord = {
  id: string;
  code: string;
  buyerName: string;
  buyerEmail: string;
  recipientName: string | null;
  amountChf: number;
  balanceChf: number;
  type: GiftCardType;
  status: GiftCardStatus;
  purchasedAt: string;
  purchasedLabel: string;
  expiresLabel: string;
  qrPlaceholder: string;
  usageHistory: GiftCardUsageEvent[];
};

export type GiftCardTypeFilter = "all" | GiftCardType;
