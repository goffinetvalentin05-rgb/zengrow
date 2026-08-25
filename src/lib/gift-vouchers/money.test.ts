import { describe, expect, it } from "vitest";
import {
  centsToChf,
  chfToCents,
  formatAmountInput,
  parseAmountInput,
  remainingAfterRedeem,
  validateAmountInput,
} from "@/src/lib/gift-vouchers/money";

describe("chfToCents", () => {
  it("convertit un montant CHF en centimes", () => {
    expect(chfToCents(100)).toBe(10000);
    expect(chfToCents(36.5)).toBe(3650);
    expect(chfToCents(0.5)).toBe(50);
    expect(chfToCents(80.1)).toBe(8010);
  });

  it("refuse un montant nul, négatif ou trop précis", () => {
    expect(() => chfToCents(0)).toThrow(/supérieur à 0/);
    expect(() => chfToCents(-10)).toThrow(/supérieur à 0/);
    expect(() => chfToCents(60.123)).toThrow(/deux décimales/);
  });
});

describe("centsToChf", () => {
  it("reconvertit les centimes en CHF", () => {
    expect(centsToChf(10000)).toBe(100);
    expect(centsToChf(3650)).toBe(36.5);
  });
});

describe("parseAmountInput / validateAmountInput", () => {
  it("accepte un montant CHF avec virgule ou point", () => {
    expect(parseAmountInput("60")).toBe(60);
    expect(parseAmountInput("60.50")).toBe(60.5);
    expect(parseAmountInput("60,50")).toBe(60.5);
    expect(formatAmountInput(80)).toBe("80.00");
  });

  it("refuse un champ vide, 0 ou plus de deux décimales", () => {
    expect(parseAmountInput("")).toBeNull();
    expect(parseAmountInput("0")).toBeNull();
    expect(parseAmountInput("60.123")).toBeNull();
    expect(validateAmountInput("", 80)).toEqual({ error: "Le montant doit être supérieur à 0." });
    expect(validateAmountInput("60.123", 80)).toEqual({
      error: "Le montant ne peut pas avoir plus de deux décimales.",
    });
    expect(validateAmountInput("90", 80)).toEqual({ error: "Le montant dépasse le solde restant." });
  });

  it("calcule le solde restant en centimes (80 − 60 = 20)", () => {
    expect(remainingAfterRedeem(80, 60)).toBe(20);
    expect(remainingAfterRedeem(80.1, 0.1)).toBe(80);
    expect(validateAmountInput("60", 80)).toEqual({ amount: 60 });
  });
});
