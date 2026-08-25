import { describe, expect, it } from "vitest";
import {
  generateGiftVoucherPublicToken,
  giftVoucherPublicPath,
  giftVoucherPublicUrl,
  isGiftVoucherPublicToken,
  parseGiftVoucherQrPayload,
} from "@/src/lib/gift-vouchers/public-token";

describe("generateGiftVoucherPublicToken", () => {
  it("produit 32 bytes hex non prédictibles", () => {
    const bytes = Uint8Array.from({ length: 32 }, (_, i) => i);
    const token = generateGiftVoucherPublicToken(() => bytes);
    expect(token).toHaveLength(64);
    expect(isGiftVoucherPublicToken(token)).toBe(true);
    expect(token).toBe("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f");
  });

  it("génère des tokens distincts", () => {
    const tokens = new Set(Array.from({ length: 20 }, () => generateGiftVoucherPublicToken()));
    expect(tokens.size).toBe(20);
  });
});

describe("parseGiftVoucherQrPayload", () => {
  const token = "ab".repeat(32);

  it("extrait le token d’une URL /v/[token]", () => {
    expect(parseGiftVoucherQrPayload(`https://zengrow.ch/v/${token}`)).toBe(token);
    expect(parseGiftVoucherQrPayload(`https://zengrow.ch/v/${token}?x=1`)).toBe(token);
    expect(parseGiftVoucherQrPayload(`/v/${token}`)).toBe(token);
  });

  it("accepte un token brut", () => {
    expect(parseGiftVoucherQrPayload(token.toUpperCase())).toBe(token);
  });

  it("refuse un QR qui n’est pas un bon ZenGrow", () => {
    expect(parseGiftVoucherQrPayload("ZG-8K4M-2P7Q")).toBeNull();
    expect(parseGiftVoucherQrPayload("https://zengrow.ch/r/demo")).toBeNull();
    expect(parseGiftVoucherQrPayload("https://example.com/v/not-a-token")).toBeNull();
    expect(parseGiftVoucherQrPayload("")).toBeNull();
  });

  it("construit l’URL publique sans données sensibles", () => {
    expect(giftVoucherPublicPath(token)).toBe(`/v/${token}`);
    expect(giftVoucherPublicUrl(token, "https://zengrow.ch")).toBe(`https://zengrow.ch/v/${token}`);
    expect(giftVoucherPublicUrl(token, "https://zengrow.ch")).not.toMatch(/restaurant/i);
    expect(giftVoucherPublicUrl(token, "https://zengrow.ch")).not.toMatch(/voucher/i);
  });
});

describe("token rotation", () => {
  it("invalide l’ancien token après rotation", () => {
    const previous = generateGiftVoucherPublicToken();
    const next = generateGiftVoucherPublicToken();
    expect(next).not.toBe(previous);
    expect(isGiftVoucherPublicToken(previous)).toBe(true);
    expect(isGiftVoucherPublicToken(next)).toBe(true);
  });
});
