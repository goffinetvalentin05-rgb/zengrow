export const GIFT_VOUCHER_OFFER_KINDS = ["monetary", "experience"] as const;
export const GIFT_VOUCHER_OFFER_STATUSES = ["active", "inactive", "archived"] as const;

export type GiftVoucherOfferKind = (typeof GIFT_VOUCHER_OFFER_KINDS)[number];
export type GiftVoucherOfferStatus = (typeof GIFT_VOUCHER_OFFER_STATUSES)[number];

export type GiftVoucherOffer = {
  id: string;
  restaurantId: string;
  title: string;
  shortDescription: string | null;
  detailedDescription: string | null;
  imageUrl: string | null;
  kind: GiftVoucherOfferKind;
  salePriceCents: number;
  faceValueCents: number | null;
  experienceLabel: string | null;
  partySize: number | null;
  validityMonths: number;
  terms: string | null;
  sortIndex: number;
  status: GiftVoucherOfferStatus;
  createdAt: string;
  updatedAt: string;
};

export type GiftVoucherOfferListItem = GiftVoucherOffer & {
  issuedCount: number;
};

export type PublicGiftVoucherOffer = {
  id: string;
  title: string;
  shortDescription: string | null;
  imageUrl: string | null;
  kind: GiftVoucherOfferKind;
  salePriceCents: number;
  faceValueCents: number | null;
  experienceLabel: string | null;
  partySize: number | null;
};

export type GiftVoucherOfferSnapshot = {
  offerId: string | null;
  offerKind: GiftVoucherOfferKind;
  title: string;
  description: string | null;
  imageUrl: string | null;
  terms: string | null;
  experienceLabel: string | null;
  partySize: number | null;
  salePriceCents: number;
  faceValueCents: number | null;
};

export type CreateGiftVoucherOfferInput = {
  title: string;
  shortDescription?: string;
  detailedDescription?: string;
  imageUrl?: string;
  kind: GiftVoucherOfferKind;
  salePriceCents: number;
  faceValueCents?: number;
  experienceLabel?: string;
  partySize?: number;
  validityMonths?: number;
  terms?: string;
  status?: Exclude<GiftVoucherOfferStatus, "archived">;
};

export type UpdateGiftVoucherOfferInput = Omit<Partial<CreateGiftVoucherOfferInput>, "status"> & {
  status?: GiftVoucherOfferStatus;
};

export function isGiftVoucherOfferKind(value: unknown): value is GiftVoucherOfferKind {
  return value === "monetary" || value === "experience";
}

export function isExperienceOfferKind(kind: GiftVoucherOfferKind | null | undefined): boolean {
  return kind === "experience";
}
