import type {
  GiftVoucherOffer,
  GiftVoucherOfferKind,
  GiftVoucherOfferSnapshot,
  GiftVoucherOfferStatus,
  PublicGiftVoucherOffer,
} from "@/src/lib/gift-vouchers/offers/types";
import { isGiftVoucherOfferKind } from "@/src/lib/gift-vouchers/offers/types";

export type GiftVoucherOfferRow = {
  id: string;
  restaurant_id: string;
  title: string;
  short_description: string | null;
  detailed_description: string | null;
  image_url: string | null;
  kind: string;
  sale_price_cents: number;
  face_value_cents: number | null;
  experience_label: string | null;
  party_size: number | null;
  validity_months: number;
  terms: string | null;
  sort_index: number;
  status: string;
  created_at: string;
  updated_at: string;
};

function isOfferStatus(value: string): value is GiftVoucherOfferStatus {
  return value === "active" || value === "inactive" || value === "archived";
}

export const GIFT_VOUCHER_OFFER_SELECT = `
  id, restaurant_id, title, short_description, detailed_description, image_url,
  kind, sale_price_cents, face_value_cents, experience_label, party_size,
  validity_months, terms, sort_index, status, created_at, updated_at
`;

export function mapGiftVoucherOfferRow(row: GiftVoucherOfferRow): GiftVoucherOffer {
  if (!isGiftVoucherOfferKind(row.kind)) {
    throw new Error("Type d’offre invalide.");
  }
  if (!isOfferStatus(row.status)) {
    throw new Error("Statut d’offre invalide.");
  }
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    title: row.title,
    shortDescription: row.short_description?.trim() || null,
    detailedDescription: row.detailed_description?.trim() || null,
    imageUrl: row.image_url?.trim() || null,
    kind: row.kind,
    salePriceCents: row.sale_price_cents,
    faceValueCents: row.face_value_cents,
    experienceLabel: row.experience_label?.trim() || null,
    partySize: row.party_size,
    validityMonths: row.validity_months,
    terms: row.terms?.trim() || null,
    sortIndex: row.sort_index,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toPublicGiftVoucherOffer(offer: GiftVoucherOffer): PublicGiftVoucherOffer {
  return {
    id: offer.id,
    title: offer.title,
    shortDescription: offer.shortDescription,
    imageUrl: offer.imageUrl,
    kind: offer.kind,
    salePriceCents: offer.salePriceCents,
    faceValueCents: offer.faceValueCents,
    experienceLabel: offer.experienceLabel,
    partySize: offer.partySize,
  };
}

export function snapshotFromOffer(offer: GiftVoucherOffer): GiftVoucherOfferSnapshot {
  const description = offer.shortDescription || offer.detailedDescription;
  return {
    offerId: offer.id,
    offerKind: offer.kind,
    title: offer.title,
    description,
    imageUrl: offer.imageUrl,
    terms: offer.terms,
    experienceLabel: offer.kind === "experience" ? offer.experienceLabel || offer.title : null,
    partySize: offer.partySize,
    salePriceCents: offer.salePriceCents,
    faceValueCents: offer.faceValueCents,
  };
}

export function issuanceAmountCents(offer: GiftVoucherOffer): number {
  if (offer.kind === "monetary") {
    return offer.faceValueCents && offer.faceValueCents > 0 ? offer.faceValueCents : offer.salePriceCents;
  }
  return offer.salePriceCents > 0 ? offer.salePriceCents : 1;
}

export function offerKindLabel(kind: GiftVoucherOfferKind): string {
  return kind === "experience" ? "Expérience" : "Montant";
}

export function formatOfferCatalogPrice(offer: Pick<GiftVoucherOffer, "kind" | "salePriceCents" | "faceValueCents">): {
  cents: number;
  label: string;
} {
  if (offer.kind === "monetary") {
    const cents = offer.faceValueCents && offer.faceValueCents > 0 ? offer.faceValueCents : offer.salePriceCents;
    return { cents, label: "valeur" };
  }
  return { cents: offer.salePriceCents, label: "prix" };
}
