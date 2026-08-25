import { describe, expect, it } from "vitest";
import { parseCreateGiftVoucherOfferInput } from "@/src/lib/gift-vouchers/offers/schemas";
import { issuanceAmountCents, snapshotFromOffer } from "@/src/lib/gift-vouchers/offers/map";
import type { GiftVoucherOffer } from "@/src/lib/gift-vouchers/offers/types";

describe("parseCreateGiftVoucherOfferInput", () => {
  it("convertit un bon monétaire en centimes", () => {
    const parsed = parseCreateGiftVoucherOfferInput({
      title: "Bon cadeau 80 CHF",
      kind: "monetary",
      salePriceChf: 80,
      faceValueChf: 80,
    });
    expect(parsed.salePriceCents).toBe(8000);
    expect(parsed.faceValueCents).toBe(8000);
    expect(parsed.kind).toBe("monetary");
  });

  it("accepte une expérience sans gros montant obligatoire côté face value", () => {
    const parsed = parseCreateGiftVoucherOfferInput({
      title: "Visite de la cave et apéritif",
      kind: "experience",
      salePriceChf: 120,
      partySize: 2,
    });
    expect(parsed.kind).toBe("experience");
    expect(parsed.salePriceCents).toBe(12000);
    expect(parsed.experienceLabel).toBe("Visite de la cave et apéritif");
    expect(parsed.partySize).toBe(2);
  });
});

describe("snapshotFromOffer", () => {
  const offer: GiftVoucherOffer = {
    id: "11111111-1111-4111-8111-111111111111",
    restaurantId: "22222222-2222-4222-8222-222222222222",
    title: "Visite de la cave et apéritif",
    shortDescription: "Pour deux",
    detailedDescription: null,
    imageUrl: "https://example.com/cave.jpg",
    kind: "experience",
    salePriceCents: 12000,
    faceValueCents: null,
    experienceLabel: "Visite de la cave et apéritif",
    partySize: 2,
    validityMonths: 12,
    terms: "Non remboursable",
    sortIndex: 0,
    status: "active",
    createdAt: "2026-08-25T00:00:00.000Z",
    updatedAt: "2026-08-25T00:00:00.000Z",
  };

  it("fige le contenu commercial pour le bon émis", () => {
    const snapshot = snapshotFromOffer(offer);
    expect(snapshot.title).toBe(offer.title);
    expect(snapshot.imageUrl).toBe(offer.imageUrl);
    expect(snapshot.offerKind).toBe("experience");
    expect(issuanceAmountCents(offer)).toBe(12000);
  });
});
