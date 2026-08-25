import { describe, expect, it } from "vitest";
import { DEFAULT_GIFT_VOUCHER_TERMS } from "@/src/lib/gift-vouchers/branding";
import { generateGiftVoucherPdf } from "@/src/lib/gift-vouchers/pdf/generate";
import type { GiftVoucherPresentation } from "@/src/lib/gift-vouchers/branding";
import { giftVoucherPublicUrl } from "@/src/lib/gift-vouchers/public-token";

const token = "cd".repeat(32);

const presentation: GiftVoucherPresentation = {
  voucherId: "33333333-3333-4333-8333-333333333333",
  restaurantId: "44444444-4444-4444-8444-444444444444",
  code: "ZG-9N5P-3Q8R",
  status: "active",
  initialAmountCents: 100000,
  remainingAmountCents: 100000,
  currency: "CHF",
  expiresAt: "2027-12-31T23:59:59.000Z",
  recipientName: "Léa",
  buyerName: "Marc",
  message: "Joyeux anniversaire — avec tout notre plaisir",
  publicToken: token,
  offerTitle: "Bon cadeau",
  restaurantName: "Auberge du Lac",
  restaurantLogoUrl: null,
  coverImageUrl: null,
  accentColor: "#1F7A6C",
  foregroundColor: "#ffffff",
  phone: null,
  email: null,
  address: null,
  terms: DEFAULT_GIFT_VOUCHER_TERMS,
  footer: "Lausanne",
  includeBuyerOnPdf: true,
  offerKind: "monetary",
  offerDescription: null,
  experienceLabel: null,
  partySize: null,
};

describe("PDF A4 bon cadeau", () => {
  it("génère un PDF même avec conditions, accents et montant >= 1000 CHF", async () => {
    const buffer = await generateGiftVoucherPdf({
      presentation,
      origin: "https://zengrow.ch",
    });
    expect(buffer.subarray(0, 4).toString("utf8")).toBe("%PDF");
    expect(buffer.byteLength).toBeGreaterThan(1000);
    expect(giftVoucherPublicUrl(token, "https://zengrow.ch")).toBe(`https://zengrow.ch/v/${token}`);
  }, 20_000);
});
