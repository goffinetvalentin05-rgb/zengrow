import { describe, expect, it } from "vitest";
import { computeSharpzScore, opportunityLevelFromPotential } from "./scoring";

describe("computeSharpzScore", () => {
  it("returns 100 for max impact, min effort, full confidence", () => {
    expect(computeSharpzScore(10, 1, 100)).toBe(100);
  });

  it("returns 10 for max impact, max effort, full confidence", () => {
    expect(computeSharpzScore(10, 10, 100)).toBe(10);
  });

  it("reduces score when confidence drops", () => {
    expect(computeSharpzScore(10, 1, 50)).toBe(50);
  });

  it("clamps out-of-range inputs", () => {
    expect(computeSharpzScore(99, -4, 200)).toBe(100);
  });
});

describe("opportunityLevelFromPotential", () => {
  it("maps potential bands", () => {
    expect(opportunityLevelFromPotential(9)).toBe("high");
    expect(opportunityLevelFromPotential(5)).toBe("medium");
    expect(opportunityLevelFromPotential(2)).toBe("low");
  });
});
