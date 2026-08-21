import { describe, expect, it } from "vitest";
import { describeAuthorizeUrl, getAuthCallbackUrl, safeAuthNextPath } from "@/src/lib/fitme/oauth";

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

describe("getAuthCallbackUrl", () => {
  it("uses localhost callback outside production", () => {
    expect(getAuthCallbackUrl()).toBe("http://localhost:3000/auth/callback");
  });
});

describe("describeAuthorizeUrl", () => {
  it("extracts redirect_to without exposing secrets", () => {
    const described = describeAuthorizeUrl(
      "https://example.supabase.co/auth/v1/authorize?provider=google&redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback",
    );
    expect(described.redirect_to).toBe("http://localhost:3000/auth/callback");
    expect(described.host).toBe("example.supabase.co");
  });
});
