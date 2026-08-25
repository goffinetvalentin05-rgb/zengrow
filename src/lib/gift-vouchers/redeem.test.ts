import { describe, expect, it } from "vitest";
import {
  applyRedeem,
  canRedeem,
  getRedeemBlockReason,
  redeemErrorMessage,
} from "@/src/lib/gift-vouchers/redeem";

const NOW = new Date("2026-08-25T12:00:00.000Z");
const NOW_ISO = NOW.toISOString();

describe("applyRedeem", () => {
  it("déduit un montant partiel et laisse le bon actif", () => {
    expect(applyRedeem(6500, 3500, NOW_ISO)).toEqual({
      remainingAmountCents: 3000,
      status: "active",
      fullyUsedAt: null,
    });
  });

  it("passe le bon en used lorsque le solde atteint 0", () => {
    expect(applyRedeem(3500, 3500, NOW_ISO)).toEqual({
      remainingAmountCents: 0,
      status: "used",
      fullyUsedAt: NOW_ISO,
    });
  });

  it("refuse un montant nul", () => {
    expect(() => applyRedeem(5000, 0, NOW_ISO)).toThrow(/supérieur à 0/);
  });

  it("refuse un montant supérieur au solde", () => {
    expect(() => applyRedeem(5000, 6000, NOW_ISO)).toThrow(/dépasse le solde/);
  });

  it("sérialise deux utilisations concurrentes si le solde est verrouillé", () => {
    const remaining = 5000;
    const first = applyRedeem(remaining, 4000, NOW_ISO);
    expect(first.remainingAmountCents).toBe(1000);
    expect(() => applyRedeem(first.remainingAmountCents, 4000, NOW_ISO)).toThrow(/dépasse le solde/);
  });
});

describe("getRedeemBlockReason", () => {
  it("autorise un bon actif non expiré", () => {
    expect(
      getRedeemBlockReason(
        { status: "active", remainingAmountCents: 6500, expiresAt: "2027-08-25T00:00:00.000Z" },
        NOW,
      ),
    ).toBeNull();
    expect(canRedeem("active", 6500, "2027-08-25T00:00:00.000Z", NOW)).toBe(true);
  });

  it("bloque les statuts non utilisables", () => {
    expect(getRedeemBlockReason({ status: "used", remainingAmountCents: 0, expiresAt: null }, NOW)).toBe("used");
    expect(getRedeemBlockReason({ status: "disabled", remainingAmountCents: 5000, expiresAt: null }, NOW)).toBe(
      "disabled",
    );
    expect(getRedeemBlockReason({ status: "draft", remainingAmountCents: 5000, expiresAt: null }, NOW)).toBe("draft");
    expect(
      getRedeemBlockReason({ status: "expired", remainingAmountCents: 5000, expiresAt: "2025-01-01T00:00:00.000Z" }, NOW),
    ).toBe("expired");
    expect(
      getRedeemBlockReason(
        { status: "active", remainingAmountCents: 5000, expiresAt: "2026-08-01T00:00:00.000Z" },
        NOW,
      ),
    ).toBe("expired");
  });

  it("expose des messages commerçant simples", () => {
    expect(redeemErrorMessage("not_found")).toBe("Ce bon n’existe pas.");
    expect(redeemErrorMessage("used")).toBe("Ce bon a déjà été utilisé.");
    expect(redeemErrorMessage("expired")).toBe("Ce bon est expiré.");
    expect(redeemErrorMessage("disabled")).toBe("Ce bon est désactivé.");
  });
});
