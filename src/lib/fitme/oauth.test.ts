import { describe, expect, it } from "vitest";
import { safeAuthNextPath } from "@/src/lib/fitme/oauth";

describe("safeAuthNextPath", () => {
  it("defaults to /start", () => {
    expect(safeAuthNextPath(null)).toBe("/start");
    expect(safeAuthNextPath("")).toBe("/start");
  });

  it("allows relative app paths", () => {
    expect(safeAuthNextPath("/onboarding")).toBe("/onboarding");
  });

  it("blocks open redirects", () => {
    expect(safeAuthNextPath("https://evil.example")).toBe("/start");
    expect(safeAuthNextPath("//evil.example")).toBe("/start");
  });
});
