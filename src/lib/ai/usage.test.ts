import { describe, expect, it } from "vitest";
import { resolveAIUsageQuota } from "@/src/lib/ai/usage";
import { AI_LIMIT_FOUNDER, AI_LIMIT_GROWTH, AI_LIMIT_PRO } from "@/src/lib/ai/limits";

describe("resolveAIUsageQuota", () => {
  it("founder gets 10000", () => {
    const q = resolveAIUsageQuota("active", "starter", "goffinetvalentin05@gmail.com");
    expect(q.limit).toBe(AI_LIMIT_FOUNDER);
    expect(q.canAccess).toBe(true);
    expect(q.isFounder).toBe(true);
  });

  it("starter active gets 0", () => {
    const q = resolveAIUsageQuota("active", "starter");
    expect(q.limit).toBe(0);
    expect(q.canAccess).toBe(false);
  });

  it("pro active gets 150", () => {
    const q = resolveAIUsageQuota("active", "pro");
    expect(q.limit).toBe(AI_LIMIT_PRO);
    expect(q.canAccess).toBe(true);
  });

  it("growth gets 500", () => {
    const q = resolveAIUsageQuota("active", "growth");
    expect(q.limit).toBe(AI_LIMIT_GROWTH);
  });
});
