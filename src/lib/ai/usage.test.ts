import { describe, expect, it } from "vitest";
import {
  AI_MONTHLY_LIMITS,
  AIUsageLimitError,
  getAIMonthlyLimit,
  resolveAIPlanTier,
} from "@/src/lib/ai/usage";

describe("resolveAIPlanTier", () => {
  it("maps trial status to trial tier", () => {
    expect(resolveAIPlanTier("trial", null)).toBe("trial");
    expect(resolveAIPlanTier("trial", "pro")).toBe("trial");
  });

  it("maps starter to basic", () => {
    expect(resolveAIPlanTier("active", "starter")).toBe("basic");
  });

  it("maps pro to pro", () => {
    expect(resolveAIPlanTier("active", "pro")).toBe("pro");
  });
});

describe("getAIMonthlyLimit", () => {
  it("returns limits per tier", () => {
    expect(getAIMonthlyLimit("trial", null)).toBe(AI_MONTHLY_LIMITS.trial);
    expect(getAIMonthlyLimit("active", "starter")).toBe(AI_MONTHLY_LIMITS.basic);
    expect(getAIMonthlyLimit("active", "pro")).toBe(AI_MONTHLY_LIMITS.pro);
  });
});

describe("AIUsageLimitError", () => {
  it("has a user-friendly default message", () => {
    const err = new AIUsageLimitError();
    expect(err.message).toContain("limite IA mensuelle");
  });
});
