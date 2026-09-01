import { describe, expect, it } from "vitest";
import {
  classifyTrafficSource,
  getBrandedTrackedProfileUrl,
  getWorkingTrackedProfileUrl,
  normalizeStoredSource,
  splitTrafficSources,
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

  it("builds tracked bio URLs without extra params", () => {
    expect(trackedProfileQuery("instagram")).toBe("utm_source=instagram&utm_medium=bio");
    expect(getBrandedTrackedProfileUrl("valentin", "instagram")).toBe(
      "sharpz.me/valentin?utm_source=instagram&utm_medium=bio",
    );
    expect(getWorkingTrackedProfileUrl("valentin", "linkedin", "http://localhost:3000")).toContain(
      "utm_source=linkedin&utm_medium=bio",
    );
    expect(trafficSourceLabel("sharpz_explore")).toBe("Sharpz Explore");
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
