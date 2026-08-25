import { describe, expect, it } from "vitest";
import { parseCreateGiftVoucherInput } from "@/src/lib/gift-vouchers/schemas";

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
