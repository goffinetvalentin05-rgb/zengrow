import { describe, expect, it } from "vitest";
import {
  clampGiftVoucherValidityMonths,
  defaultGiftVoucherExpiryDate,
  DEFAULT_GIFT_VOUCHER_SUGGESTED_AMOUNTS,
  formatSuggestedGiftVoucherAmounts,
  parseSuggestedGiftVoucherAmounts,
} from "@/src/lib/gift-vouchers/defaults";
import { giftShopEmbedSnippet, restaurantGiftShopUrl, restaurantPublicPageUrl } from "@/src/lib/settings/public-urls";

describe("gift voucher default settings", () => {
  it("borne la durée de validité", () => {
    expect(clampGiftVoucherValidityMonths(12)).toBe(12);
    expect(clampGiftVoucherValidityMonths(0)).toBe(1);
    expect(clampGiftVoucherValidityMonths(90)).toBe(60);
    expect(clampGiftVoucherValidityMonths("abc")).toBe(12);
  });

  it("parse les montants suggérés et ignore les invalides", () => {
    expect(parseSuggestedGiftVoucherAmounts([50, 100, 150])).toEqual([50, 100, 150]);
    expect(parseSuggestedGiftVoucherAmounts("80, 120, 80")).toEqual([80, 120]);
    expect(parseSuggestedGiftVoucherAmounts([-1, 0, 20000, "x"])).toEqual([...DEFAULT_GIFT_VOUCHER_SUGGESTED_AMOUNTS]);
    expect(formatSuggestedGiftVoucherAmounts([50, 100])).toBe("50 / 100");
  });

  it("calcule une date d’expiration future sans toucher aux bons existants", () => {
    const from = new Date("2026-08-25T10:00:00.000Z");
    expect(defaultGiftVoucherExpiryDate(12, from)).toBe("2027-08-25");
  });
});

describe("liens publics d’établissement", () => {
  it("utilise le slug réel", () => {
    expect(restaurantPublicPageUrl("https://zengrow.ch", "cafe-demo")).toBe("https://zengrow.ch/r/cafe-demo");
    expect(restaurantGiftShopUrl("https://zengrow.ch/", "cafe-demo")).toBe(
      "https://zengrow.ch/r/cafe-demo#bons-cadeaux",
    );
    expect(giftShopEmbedSnippet("https://zengrow.ch", "cafe-demo")).toContain("/r/cafe-demo#bons-cadeaux");
  });
});
