export type GiftCardType = "digital" | "paper";
export type GiftCardStatus = "draft" | "active" | "used" | "expired" | "disabled";

export type GiftCardUsageEvent = {
  id: string;
  dateLabel: string;
  title?: string;
  amountLabel?: string | null;
  amountUsedChf: number;
  remainingBalanceChf: number;
  kind?: string;
  label?: string;
};

export type GiftCardRecord = {
  id: string;
  code: string;
  buyerName: string;
  buyerEmail: string;
  recipientName: string | null;
  recipientEmail?: string | null;
  message?: string | null;
  amountChf: number;
  balanceChf: number;
  type: GiftCardType;
  status: GiftCardStatus;
  purchasedAt: string;
  purchasedLabel: string;
  expiresAt?: string | null;
  expiresLabel: string;
  publicToken: string;
  fullyUsedAt?: string | null;
  fullyUsedLabel?: string;
  qrPlaceholder: string;
  offerKind: "monetary" | "experience";
  offerTitle?: string | null;
  offerImageUrl?: string | null;
  offerDescription?: string | null;
  experienceLabel?: string | null;
  partySize?: number | null;
  usageHistory: GiftCardUsageEvent[];
};

export function isExperienceGiftCard(card: Pick<GiftCardRecord, "offerKind">): boolean {
  return card.offerKind === "experience";
}

export type GiftCardTypeFilter = "all" | GiftCardType;

export type GiftCardDrawerAction = "resend" | "redeem" | "disable" | "reactivate" | "rotate_qr" | "download_pdf";
