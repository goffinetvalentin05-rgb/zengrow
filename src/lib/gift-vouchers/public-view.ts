import type { GiftVoucherOfferKind } from "@/src/lib/gift-vouchers/offers/types";
import type { GiftVoucherStatus } from "@/src/lib/gift-vouchers/types";

export type PublicGiftVoucherView = {
  code: string;
  status: GiftVoucherStatus;
  initialAmountCents: number;
  remainingAmountCents: number;
  currency: string;
  expiresAt: string | null;
  recipientName: string | null;
  restaurantName: string;
  restaurantLogoUrl: string | null;
  publicToken: string;
  offerKind: GiftVoucherOfferKind;
  offerTitle: string | null;
  offerDescription: string | null;
  offerImageUrl: string | null;
  experienceLabel: string | null;
  partySize: number | null;
  message: string | null;
};

export function publicStatusHeadline(status: GiftVoucherStatus): string | null {
  if (status === "used") return "Bon entièrement utilisé";
  if (status === "expired") return "Bon expiré";
  if (status === "disabled") return "Bon désactivé";
  if (status === "draft") return "Ce bon n’est pas encore actif.";
  return null;
}

export function isPublicGiftVoucherStatus(value: string): value is GiftVoucherStatus {
  return value === "draft" || value === "active" || value === "used" || value === "expired" || value === "disabled";
}
