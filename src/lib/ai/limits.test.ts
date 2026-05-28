import { describe, expect, it } from "vitest";
import {
  AI_LIMIT_FOUNDER,
  AI_LIMIT_GROWTH,
  AI_LIMIT_PRO,
  getAIUsageLimit,
  normalizeSubscriptionPlan,
} from "@/src/lib/ai/limits";

describe("normalizeSubscriptionPlan", () => {
  it("maps starter/essential to essential", () => {
    expect(normalizeSubscriptionPlan("starter")).toBe("essential");
    expect(normalizeSubscriptionPlan("essential")).toBe("essential");
    expect(normalizeSubscriptionPlan("plan_49")).toBe("essential");
  });

  it("maps pro variants", () => {
    expect(normalizeSubscriptionPlan("pro")).toBe("pro");
    expect(normalizeSubscriptionPlan("Plan Pro")).toBe("pro");
    expect(normalizeSubscriptionPlan("plan_69")).toBe("pro");
  });

  it("maps growth/premium", () => {
    expect(normalizeSubscriptionPlan("growth")).toBe("growth");
    expect(normalizeSubscriptionPlan("premium")).toBe("growth");
    expect(normalizeSubscriptionPlan("plan_89")).toBe("growth");
  });
});

describe("getAIUsageLimit", () => {
  it("gives founder 10000", () => {
    const r = getAIUsageLimit({
      plan: "starter",
      status: "active",
      userEmail: "goffinetvalentin05@gmail.com",
    });
    expect(r.isFounder).toBe(true);
    expect(r.limit).toBe(AI_LIMIT_FOUNDER);
    expect(r.canAccess).toBe(true);
  });

  it("blocks essential/starter active", () => {
    const r = getAIUsageLimit({ plan: "starter", status: "active" });
    expect(r.limit).toBe(0);
    expect(r.canAccess).toBe(false);
  });

  it("allows pro with 150", () => {
    const r = getAIUsageLimit({ plan: "pro", status: "active" });
    expect(r.limit).toBe(AI_LIMIT_PRO);
    expect(r.canAccess).toBe(true);
  });

  it("allows growth with 500", () => {
    const r = getAIUsageLimit({ plan: "premium", status: "active" });
    expect(r.limit).toBe(AI_LIMIT_GROWTH);
    expect(r.canAccess).toBe(true);
  });

  it("trial gets pro-level access", () => {
    const r = getAIUsageLimit({ plan: null, status: "trial" });
    expect(r.canAccess).toBe(true);
    expect(r.limit).toBeGreaterThan(0);
  });
});
