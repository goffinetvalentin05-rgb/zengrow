import { describe, expect, it } from "vitest";
import { calculatePurchasePoints, computeRewardState } from "@/src/lib/loyalty/points";

describe("calculatePurchasePoints", () => {
  it("1 CHF = 1 point", () => {
    expect(calculatePurchasePoints(6200, 100, 1)).toBe(62);
  });

  it("1 CHF = 2 points", () => {
    expect(calculatePurchasePoints(6200, 100, 2)).toBe(124);
  });

  it("10 CHF = 1 point (arrondi inférieur)", () => {
    expect(calculatePurchasePoints(6200, 1000, 1)).toBe(6);
    expect(calculatePurchasePoints(999, 1000, 1)).toBe(0);
  });

  it("refuse les montants invalides", () => {
    expect(calculatePurchasePoints(0, 100, 1)).toBe(0);
    expect(calculatePurchasePoints(100, 0, 1)).toBe(0);
  });
});

describe("computeRewardState", () => {
  const rewards = [
    { id: "a", title: "5 CHF offerts", pointsRequired: 500, active: true },
    { id: "b", title: "15 CHF offerts", pointsRequired: 1000, active: true },
    { id: "c", title: "Produit offert", pointsRequired: 2000, active: true },
    { id: "d", title: "Inactive", pointsRequired: 100, active: false },
  ];

  it("signale la récompense disponible et la prochaine", () => {
    const state = computeRewardState(740, rewards);
    expect(state.available.map((r) => r.id)).toEqual(["a"]);
    expect(state.bestAvailable?.id).toBe("a");
    expect(state.next?.id).toBe("b");
    expect(state.pointsToNext).toBe(260);
  });

  it("n’offre rien sous le premier palier", () => {
    const state = computeRewardState(260, rewards);
    expect(state.available).toEqual([]);
    expect(state.next?.pointsRequired).toBe(500);
    expect(state.pointsToNext).toBe(240);
  });
});
