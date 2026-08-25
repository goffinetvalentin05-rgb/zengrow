import { describe, expect, it } from "vitest";
import { parseCreateGiftVoucherInput, parseLookupGiftVoucherCode, parseLookupGiftVoucherToken, parseRedeemGiftVoucherInput } from "@/src/lib/gift-vouchers/schemas";

describe("parseCreateGiftVoucherInput", () => {
  it("accepte une création digitale minimale", () => {
    const parsed = parseCreateGiftVoucherInput({
      type: "digital",
      amount: 100,
    });
    expect(parsed.type).toBe("digital");
    expect(parsed.amount).toBe(100);
  });

  it("normalise les e-mails et ignore les champs vides", () => {
    const parsed = parseCreateGiftVoucherInput({
      type: "paper",
      amount: "50",
      buyerName: "Anna L.",
      buyerEmail: "anna@email.ch",
      recipientName: "",
      message: "   ",
    });
    expect(parsed.buyerEmail).toBe("anna@email.ch");
    expect(parsed.recipientName).toBeUndefined();
    expect(parsed.message).toBeUndefined();
  });

  it("refuse un montant invalide", () => {
    expect(() => parseCreateGiftVoucherInput({ type: "digital", amount: 0 })).toThrow();
    expect(() => parseCreateGiftVoucherInput({ type: "digital", amount: -5 })).toThrow();
  });

  it("refuse un e-mail invalide", () => {
    expect(() =>
      parseCreateGiftVoucherInput({ type: "digital", amount: 20, buyerEmail: "pas-un-email" }),
    ).toThrow();
  });

  it("refuse une expiration passée", () => {
    expect(() =>
      parseCreateGiftVoucherInput({
        type: "digital",
        amount: 20,
        expiresAt: "2020-01-01",
      }),
    ).toThrow();
  });

  it("ignore un restaurant_id envoyé par le client", () => {
    const parsed = parseCreateGiftVoucherInput({
      type: "digital",
      amount: 40,
      restaurantId: "11111111-1111-1111-1111-111111111111",
    });
    expect(parsed).not.toHaveProperty("restaurantId");
  });
});

describe("parseRedeemGiftVoucherInput", () => {
  it("accepte un encaissement par code", () => {
    const parsed = parseRedeemGiftVoucherInput({
      code: "zg-8k4m-2p7q",
      amount: "35.00",
      restaurantId: "11111111-1111-1111-1111-111111111111",
    });
    expect(parsed.code).toBe("ZG-8K4M-2P7Q");
    expect(parsed.amount).toBe(35);
    expect(parsed).not.toHaveProperty("restaurantId");
  });

  it("accepte une virgule suisse et un voucherId", () => {
    const parsed = parseRedeemGiftVoucherInput({
      voucherId: "11111111-1111-4111-8111-111111111111",
      amount: "35,50",
    });
    expect(parsed.voucherId).toBe("11111111-1111-4111-8111-111111111111");
    expect(parsed.amount).toBe(35.5);
  });

  it("refuse un montant nul ou manquant d’identifiant", () => {
    expect(() => parseRedeemGiftVoucherInput({ code: "ZG-8K4M-2P7Q", amount: 0 })).toThrow();
    expect(() => parseRedeemGiftVoucherInput({ amount: 20 })).toThrow();
  });

  it("accepte une validation totale sans montant client", () => {
    const parsed = parseRedeemGiftVoucherInput({
      voucherId: "11111111-1111-4111-8111-111111111111",
      consumeAll: true,
    });
    expect(parsed.consumeAll).toBe(true);
    expect(parsed.amount).toBeUndefined();
  });
});

describe("parseLookupGiftVoucherCode", () => {
  it("normalise le code recherché", () => {
    expect(parseLookupGiftVoucherCode({ code: "zg 8k4m 2p7q" })).toBe("ZG-8K4M-2P7Q");
  });

  it("refuse un code inconnu / invalide", () => {
    expect(() => parseLookupGiftVoucherCode({ code: "ABC" })).toThrow();
  });
});

describe("parseLookupGiftVoucherToken", () => {
  it("accepte un token public opaque", () => {
    const token = "ab".repeat(32);
    expect(parseLookupGiftVoucherToken({ token, restaurantId: "x" })).toBe(token);
  });

  it("refuse un token inexistant / invalide", () => {
    expect(() => parseLookupGiftVoucherToken({ token: "ZG-8K4M-2P7Q" })).toThrow();
    expect(() => parseLookupGiftVoucherToken({ token: "" })).toThrow();
  });
});
