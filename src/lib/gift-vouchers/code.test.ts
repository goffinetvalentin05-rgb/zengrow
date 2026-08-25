import { describe, expect, it } from "vitest";
import { generateGiftVoucherCode, isGiftVoucherCode } from "@/src/lib/gift-vouchers/code";

describe("generateGiftVoucherCode", () => {
  it("produit un code lisible ZG-XXXX-XXXX", () => {
    const bytes = Uint8Array.from([0, 1, 31, 32, 33, 63, 64, 255]);
    const code = generateGiftVoucherCode(() => bytes);
    expect(isGiftVoucherCode(code)).toBe(true);
    expect(code.startsWith("ZG-")).toBe(true);
    expect(code).not.toMatch(/[01IO]/);
  });

  it("génère des codes distincts avec de l’entropie réelle", () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateGiftVoucherCode()));
    expect(codes.size).toBe(20);
  });
});
