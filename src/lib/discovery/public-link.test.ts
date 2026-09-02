import { describe, expect, it, vi } from "vitest";
import { USERNAME_PATTERN } from "@/src/lib/discovery/constants";
import {
  classifyPublicSlug,
  getBrandedProfilePreview,
  getProfileShareText,
  getWorkingProfileUrl,
  publicSlugStatusMessage,
  readUtmCampaign,
  readUtmMedium,
  readUtmSource,
  referrerHostFromUrl,
  sanitizeTrackingPlatform,
} from "@/src/lib/discovery/public-link";
import { isReservedProfileSlug, isValidPublicSlug, slugifyUsername } from "@/src/lib/discovery/slug";

describe("public Sharpz slug", () => {
  it("accepts simple, hyphenated and numeric slugs", () => {
    for (const slug of ["valentin", "valentin-g", "valentin21", "sharpz-builder"]) {
      expect(USERNAME_PATTERN.test(slug)).toBe(true);
      expect(classifyPublicSlug(slug)).toBe("ok");
      expect(isValidPublicSlug(slug)).toBe(true);
    }
  });

  it("rejects spaces, special characters and leading slashes", () => {
    expect(classifyPublicSlug("valentin goffinet")).toBe("invalid");
    expect(classifyPublicSlug("valentin@")).toBe("invalid");
    expect(classifyPublicSlug("/valentin")).toBe("ok");
    expect(classifyPublicSlug("vale/ntin")).toBe("invalid");
    expect(classifyPublicSlug("ab")).toBe("invalid");
    expect(classifyPublicSlug("-valentin")).toBe("invalid");
    expect(classifyPublicSlug("valentin-")).toBe("invalid");
  });

  it("marks product routes as reserved", () => {
    for (const slug of [
      "explore",
      "search",
      "saved",
      "following",
      "analytics",
      "settings",
      "me",
      "onboarding",
      "pro",
      "login",
      "admin",
      "api",
    ]) {
      expect(isReservedProfileSlug(slug)).toBe(true);
      expect(classifyPublicSlug(slug)).toBe("reserved");
      expect(isValidPublicSlug(slug)).toBe(false);
      expect(publicSlugStatusMessage("reserved")).toBe("This link is reserved.");
    }
  });

  it("slugifies display names with hyphens, not spaces", () => {
    expect(slugifyUsername("Valentin Goffinet")).toBe("valentin-goffinet");
    expect(slugifyUsername("Valentin@")).toBe("valentin");
  });

  it("keeps UTM source for later analytics", () => {
    expect(readUtmSource("utm_source=instagram&utm_medium=bio")).toBe("instagram");
    expect(readUtmMedium("utm_source=instagram&utm_medium=bio")).toBe("bio");
    expect(readUtmCampaign("utm_source=instagram&utm_campaign=launch")).toBe("launch");
    expect(readUtmSource({ utm_source: "tiktok", utm_medium: "bio" })).toBe("tiktok");
    expect(sanitizeTrackingPlatform("Instagram")).toBe("instagram");
    expect(sanitizeTrackingPlatform("not a source!")).toBeNull();
    expect(referrerHostFromUrl("https://www.instagram.com/reel/abc", "localhost")).toBe("instagram.com");
    expect(referrerHostFromUrl("https://localhost:3000/explore", "localhost")).toBeNull();
  });

  it("builds a branded share preview", () => {
    expect(getBrandedProfilePreview("valentin")).toBe("sharpz.me/valentin");
    expect(getProfileShareText("valentin")).toContain("sharpz.me/valentin");
  });

  it("opens working profile URLs on localhost in development", () => {
    expect(getWorkingProfileUrl("valentin", "http://localhost:3000")).toBe("http://localhost:3000/valentin");
    expect(getWorkingProfileUrl("valentin", "http://127.0.0.1:3000")).toBe("http://127.0.0.1:3000/valentin");
  });

  it("builds production working URLs from the public site URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://sharpz.me");
    expect(getWorkingProfileUrl("valentin")).toBe("https://sharpz.me/valentin");
    vi.unstubAllEnvs();
  });
});
