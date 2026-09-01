import { describe, expect, it } from "vitest";
import { USERNAME_PATTERN } from "@/src/lib/discovery/constants";
import {
  classifyPublicSlug,
  getBrandedProfilePreview,
  getProfileShareText,
  publicSlugStatusMessage,
  readUtmSource,
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
    for (const slug of ["explore", "search", "settings", "admin", "api", "me", "login"]) {
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
    expect(readUtmSource({ utm_source: "tiktok", utm_medium: "bio" })).toBe("tiktok");
    expect(sanitizeTrackingPlatform("Instagram")).toBe("instagram");
    expect(sanitizeTrackingPlatform("not a source!")).toBeNull();
  });

  it("builds a branded share preview", () => {
    expect(getBrandedProfilePreview("valentin")).toBe("sharpz.me/valentin");
    expect(getProfileShareText("valentin")).toContain("sharpz.me/valentin");
  });
});
