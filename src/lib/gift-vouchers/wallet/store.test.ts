import { describe, expect, it } from "vitest";
import { parseGiftVoucherSettingsInput } from "@/src/lib/gift-vouchers/schemas";
import {
  authenticationTokensMatch,
  parseApplePassAuthorization,
  passUpdatedSince,
} from "@/src/lib/gift-vouchers/wallet/store";

describe("paramètres bons cadeaux", () => {
  it("accepte une personnalisation partielle", () => {
    const parsed = parseGiftVoucherSettingsInput({
      offerTitle: "Menu découverte",
      includeBuyerOnPdf: true,
    });
    expect(parsed.offerTitle).toBe("Menu découverte");
    expect(parsed.includeBuyerOnPdf).toBe(true);
  });

  it("refuse une couleur invalide", () => {
    expect(() => parseGiftVoucherSettingsInput({ accentColor: "green" })).toThrow();
  });
});

describe("authentification PassKit", () => {
  it("parse le header ApplePass", () => {
    expect(parseApplePassAuthorization("ApplePass abcdef")).toBe("abcdef");
    expect(parseApplePassAuthorization("Bearer abcdef")).toBeNull();
    expect(parseApplePassAuthorization(null)).toBeNull();
  });

  it("compare les tokens sans fuite de timing évidente", () => {
    const token = "a".repeat(64);
    expect(authenticationTokensMatch(token, token)).toBe(true);
    expect(authenticationTokensMatch(token, "b".repeat(64))).toBe(false);
    expect(authenticationTokensMatch(token, "short")).toBe(false);
  });

  it("détecte un pass plus récent que passesUpdatedSince", () => {
    expect(passUpdatedSince("2026-08-25T12:00:00.000Z", "1000")).toBe(true);
    expect(passUpdatedSince("2026-08-25T12:00:00.000Z", String(Date.parse("2026-08-25T12:00:00.000Z")))).toBe(false);
  });
});
