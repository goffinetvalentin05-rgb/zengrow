import { describe, expect, it } from "vitest";
import { canAccessAI } from "@/src/lib/ai/access";
import { AI_LIMIT_PRO } from "@/src/lib/ai/limits";

describe("canAccessAI", () => {
  it("allows pro active subscribers", () => {
    expect(canAccessAI("pro", "active")).toBe(true);
  });

  it("denies starter active subscribers (49 CHF)", () => {
    expect(canAccessAI("starter", "active")).toBe(false);
  });

  it("allows trial", () => {
    expect(canAccessAI("starter", "trial")).toBe(true);
  });

  it("allows founder regardless of plan in DB", () => {
    expect(canAccessAI("starter", "active", "goffinetvalentin05@gmail.com")).toBe(true);
  });
});

describe("founder vs pro limit", () => {
  it("founder is not confused with pro limit only", () => {
    expect(canAccessAI("starter", "active", "goffinetvalentin05@gmail.com")).toBe(true);
    expect(AI_LIMIT_PRO).toBe(150);
  });
});
