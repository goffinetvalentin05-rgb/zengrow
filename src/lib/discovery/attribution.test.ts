import { describe, expect, it } from "vitest";
import {
  classifyTrafficSource,
  getBrandedTrackedProfileUrl,
  getWorkingTrackedProfileUrl,
  normalizeStoredSource,
  readTrackedSourceFromPathname,
  resolveTrackedBioFromSourceCode,
  splitTrafficSources,
  trackedBioSourceCode,
  trackedProfilePath,
  trackedProfileQuery,
  trafficSourceLabel,
} from "@/src/lib/discovery/attribution";
import { connectionContactMethods } from "@/src/lib/discovery/contact";
import type { SocialLink } from "@/src/lib/discovery/types";

describe("traffic attribution", () => {
  it("stores explicit Sharpz surfaces as sharpz_* sources", () => {
    expect(normalizeStoredSource("explore")).toBe("sharpz_explore");
    expect(normalizeStoredSource("search")).toBe("sharpz_search");
    expect(normalizeStoredSource("saved")).toBe("sharpz_saved");
    expect(normalizeStoredSource("sharpz_following")).toBe("sharpz_following");
  });

  it("prefers internal Sharpz source over UTM and referrer", () => {
    expect(
      classifyTrafficSource({
        source: "explore",
        utmSource: "instagram",
        referrerHost: "youtube.com",
      }),
    ).toBe("sharpz_explore");
  });

  it("uses UTM for external bios and never invents Instagram", () => {
    expect(classifyTrafficSource({ source: "direct", utmSource: "instagram" })).toBe("instagram");
    expect(classifyTrafficSource({ source: "direct", utmSource: "youtube" })).toBe("youtube");
    expect(classifyTrafficSource({ source: "direct" })).toBe("direct");
    expect(classifyTrafficSource({ source: "direct", utmSource: "newsletter" })).toBe("other");
  });

  it("uses referrer only as a fallback for known hosts", () => {
    expect(classifyTrafficSource({ source: "direct", referrerHost: "www.tiktok.com" })).toBe("tiktok");
    expect(classifyTrafficSource({ source: "direct", referrerHost: "random.example" })).toBe("other");
  });

  it("builds short tracked bio URLs without visible UTM params", () => {
    expect(trackedProfileQuery("instagram")).toBe("utm_source=instagram&utm_medium=bio");
    expect(trackedBioSourceCode("instagram")).toBe("ig");
    expect(trackedBioSourceCode("tiktok")).toBe("tt");
    expect(trackedBioSourceCode("youtube")).toBe("yt");
    expect(trackedBioSourceCode("linkedin")).toBe("in");
    expect(trackedBioSourceCode("x")).toBe("x");
    expect(getBrandedTrackedProfileUrl("valentin", "instagram")).toBe("sharpz.me/valentin/ig");
    expect(getBrandedTrackedProfileUrl("valentin", "tiktok")).toBe("sharpz.me/valentin/tt");
    expect(getBrandedTrackedProfileUrl("valentin", "youtube")).toBe("sharpz.me/valentin/yt");
    expect(getBrandedTrackedProfileUrl("valentin", "linkedin")).toBe("sharpz.me/valentin/in");
    expect(getBrandedTrackedProfileUrl("valentin", "x")).toBe("sharpz.me/valentin/x");
    expect(getBrandedTrackedProfileUrl("valentin", "instagram")).not.toContain("utm_");
    expect(getBrandedTrackedProfileUrl("valentin", "instagram")).not.toContain("?");
    expect(trackedProfilePath("valentin", "instagram")).toBe("/valentin/ig");
    expect(getWorkingTrackedProfileUrl("valentin", "linkedin", "http://localhost:3000")).toMatch(/\/valentin\/in$/);
    expect(getWorkingTrackedProfileUrl("valentin", "linkedin", "http://localhost:3000")).not.toContain("utm_");
    expect(trafficSourceLabel("sharpz_explore")).toBe("Sharpz Explore");
  });

  it("maps only known short source codes to bio attribution", () => {
    expect(resolveTrackedBioFromSourceCode("ig")).toEqual({
      code: "ig",
      platform: "instagram",
      utmSource: "instagram",
      utmMedium: "bio",
    });
    expect(resolveTrackedBioFromSourceCode("TT")).toMatchObject({ platform: "tiktok", utmSource: "tiktok" });
    expect(resolveTrackedBioFromSourceCode("yt")).toMatchObject({ platform: "youtube" });
    expect(resolveTrackedBioFromSourceCode("in")).toMatchObject({ platform: "linkedin" });
    expect(resolveTrackedBioFromSourceCode("x")).toMatchObject({ platform: "x" });
    expect(resolveTrackedBioFromSourceCode("instagram")).toBeNull();
    expect(resolveTrackedBioFromSourceCode("foo")).toBeNull();
    expect(resolveTrackedBioFromSourceCode("")).toBeNull();
  });

  it("reads tracked source from a profile pathname and ignores product routes", () => {
    expect(readTrackedSourceFromPathname("/valentin/ig")?.utmSource).toBe("instagram");
    expect(readTrackedSourceFromPathname("/valentin/tt")?.utmMedium).toBe("bio");
    expect(readTrackedSourceFromPathname("/valentin")).toBeNull();
    expect(readTrackedSourceFromPathname("/valentin/nope")).toBeNull();
    expect(readTrackedSourceFromPathname("/explore/ig")).toBeNull();
    expect(readTrackedSourceFromPathname("/search/tt")).toBeNull();
    expect(readTrackedSourceFromPathname("/settings/yt")).toBeNull();
  });

  it("splits Sharpz discovery vs external traffic", () => {
    const split = splitTrafficSources([
      { key: "sharpz_explore", count: 58 },
      { key: "instagram", count: 42 },
    ]);
    expect(split.discoveryShare).toBe(58);
    expect(split.externalShare).toBe(42);
  });
});

describe("connection contact methods", () => {
  const link = (platform: SocialLink["platform"], url: string): SocialLink => ({
    id: platform,
    profileId: "p1",
    platform,
    url,
    followerCount: null,
    sortIndex: 0,
  });

  it("orders Instagram, LinkedIn and email first", () => {
    const methods = connectionContactMethods({
      email: "maya@example.org",
      socialLinks: [
        link("website", "https://maya.test"),
        link("x", "https://x.com/maya"),
        link("linkedin", "https://linkedin.com/in/maya"),
        link("instagram", "https://instagram.com/maya"),
      ],
    });
    expect(methods.map((item) => item.platform)).toEqual(["instagram", "linkedin", "email", "x", "website"]);
    expect(methods[2]?.href).toBe("mailto:maya@example.org");
  });

  it("returns an empty list when nothing is available", () => {
    expect(connectionContactMethods({ socialLinks: [], email: null })).toEqual([]);
  });
});
