import { describe, expect, it } from "vitest";
import { centsToChf, chfToCents } from "@/src/lib/gift-vouchers/money";

describe("chfToCents", () => {
  it("convertit un montant CHF en centimes", () => {
    expect(chfToCents(100)).toBe(10000);
    expect(chfToCents(36.5)).toBe(3650);
    expect(chfToCents(0.5)).toBe(50);
  });

  it("refuse un montant nul ou négatif", () => {
    expect(() => chfToCents(0)).toThrow(/supérieur à 0/);
    expect(() => chfToCents(-10)).toThrow(/supérieur à 0/);
  });
});

describe("centsToChf", () => {
  it("reconvertit les centimes en CHF", () => {
    expect(centsToChf(10000)).toBe(100);
    expect(centsToChf(3650)).toBe(36.5);
  });
});
