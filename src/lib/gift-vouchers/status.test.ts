import { describe, expect, it } from "vitest";
import { applyMarkUsed, applyReactivate, canDisable, canMarkUsed, canReactivate } from "@/src/lib/gift-vouchers/status";

describe("gift voucher status", () => {
  it("marque un bon comme utilisé avec solde 0", () => {
    const next = applyMarkUsed("2026-08-25T10:00:00.000Z");
    expect(next.status).toBe("used");
    expect(next.remainingAmountCents).toBe(0);
    expect(next.fullyUsedAt).toBe("2026-08-25T10:00:00.000Z");
  });

  it("réactive vers active si un solde reste", () => {
    expect(applyReactivate(3600)).toBe("active");
  });

  it("réactive vers used si le solde est 0", () => {
    expect(applyReactivate(0)).toBe("used");
  });

  it("n’autorise l’utilisation manuelle que sur un bon actif avec solde", () => {
    expect(canMarkUsed("active", 1000)).toBe(true);
    expect(canMarkUsed("active", 0)).toBe(false);
    expect(canMarkUsed("used", 0)).toBe(false);
    expect(canDisable("active")).toBe(true);
    expect(canDisable("used")).toBe(false);
    expect(canReactivate("disabled")).toBe(true);
    expect(canReactivate("active")).toBe(false);
  });
});
