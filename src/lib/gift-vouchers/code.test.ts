import { describe, expect, it } from "vitest";
import { generateGiftVoucherCode, isGiftVoucherCode, normalizeGiftVoucherCode } from "@/src/lib/gift-vouchers/code";

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

describe("normalizeGiftVoucherCode", () => {
  it("accepte le format canonique et les variantes de saisie", () => {
    expect(normalizeGiftVoucherCode("ZG-8K4M-2P7Q")).toBe("ZG-8K4M-2P7Q");
    expect(normalizeGiftVoucherCode("zg 8k4m 2p7q")).toBe("ZG-8K4M-2P7Q");
    expect(normalizeGiftVoucherCode("ZG8K4M2P7Q")).toBe("ZG-8K4M-2P7Q");
  });

  it("refuse un code invalide", () => {
    expect(normalizeGiftVoucherCode("ABC-123")).toBeNull();
    expect(normalizeGiftVoucherCode("ZG-0000-1111")).toBeNull();
  });
});
