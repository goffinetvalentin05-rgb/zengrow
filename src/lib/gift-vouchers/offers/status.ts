import type { GiftVoucherOfferKind, GiftVoucherOfferStatus } from "@/src/lib/gift-vouchers/offers/types";

export function offerStatusLabel(status: GiftVoucherOfferStatus): string {
  if (status === "active") return "Publiée";
  if (status === "archived") return "Archivée";
  return "Masquée";
}

export function offerKindShortLabel(kind: GiftVoucherOfferKind): string {
  return kind === "experience" ? "Expérience" : "Montant";
}

export function offerValidityLabel(months: number): string {
  if (months === 1) return "1 mois";
  return `${months} mois`;
}
