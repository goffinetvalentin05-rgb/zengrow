import { describe, expect, it } from "vitest";
import { canAccessAI } from "@/src/lib/ai/access";

describe("canAccessAI", () => {
  it("allows pro active subscribers", () => {
    expect(canAccessAI("pro", "active")).toBe(true);
  });

  it("denies starter active subscribers (49 CHF)", () => {
    expect(canAccessAI("starter", "active")).toBe(false);
  });

  it("allows trial regardless of plan", () => {
    expect(canAccessAI("starter", "trial")).toBe(true);
    expect(canAccessAI(null, "trial")).toBe(true);
  });
});
