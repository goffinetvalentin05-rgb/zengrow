import { describe, expect, it } from "vitest";
import {
  consumePublicVoucherRateLimit,
  resetPublicVoucherRateLimitForTests,
} from "@/src/lib/gift-vouchers/public-rate-limit";
import { publicStatusHeadline } from "@/src/lib/gift-vouchers/public-view";

describe("public voucher rate limit", () => {
  it("autorise un volume raisonnable puis bloque", () => {
    resetPublicVoucherRateLimitForTests();
    for (let i = 0; i < 40; i += 1) {
      expect(consumePublicVoucherRateLimit("1.1.1.1")).toBe(true);
    }
    expect(consumePublicVoucherRateLimit("1.1.1.1")).toBe(false);
    expect(consumePublicVoucherRateLimit("2.2.2.2")).toBe(true);
  });
});

describe("publicStatusHeadline", () => {
  it("affiche un statut clair", () => {
    expect(publicStatusHeadline("used")).toBe("Bon entièrement utilisé");
    expect(publicStatusHeadline("expired")).toBe("Bon expiré");
    expect(publicStatusHeadline("disabled")).toBe("Bon désactivé");
    expect(publicStatusHeadline("active")).toBeNull();
  });
});
