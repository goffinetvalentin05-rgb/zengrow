import { describe, expect, it } from "vitest";
import {
  activeProfileBlocks,
  isProfileBlockType,
  isProfileCtaType,
  mapConversionMetrics,
  resolveProfileCta,
} from "@/src/lib/discovery/conversion";

describe("profile conversion", () => {
  it("accepts known CTA and block types only", () => {
    expect(isProfileCtaType("newsletter")).toBe(true);
    expect(isProfileCtaType("rainbow")).toBe(false);
    expect(isProfileBlockType("booking")).toBe(true);
    expect(isProfileBlockType("calendar")).toBe(false);
  });

  it("requires a label and URL before showing the primary CTA", () => {
    expect(resolveProfileCta({ ctaLabel: "See my SaaS", ctaUrl: "", ctaType: "project" })).toBeNull();
    expect(resolveProfileCta({ ctaLabel: "", ctaUrl: "https://sharpz.ch", ctaType: "website" })).toBeNull();
    expect(resolveProfileCta({ ctaLabel: "See my SaaS", ctaUrl: "https://sharpz.ch", ctaType: "project" })).toEqual({
      label: "See my SaaS",
      url: "https://sharpz.ch",
      type: "project",
    });
  });

  it("keeps at most three active blocks with a URL", () => {
    const blocks = [
      { isActive: true, url: "https://a.com" },
      { isActive: false, url: "https://b.com" },
      { isActive: true, url: "" },
      { isActive: true, url: "https://c.com" },
      { isActive: true, url: "https://d.com" },
      { isActive: true, url: "https://e.com" },
    ];
    expect(activeProfileBlocks(blocks)).toHaveLength(3);
  });

  it("maps conversion stats from real event counts", () => {
    const mapped = mapConversionMetrics({
      views: 84,
      ctaClicks: 10,
      blockClicks: [
        { key: "newsletter", label: "Newsletter", count: 4 },
        { key: "booking", label: "Book a call", count: 7 },
      ],
    });
    expect(mapped.ctaClicks).toBe(10);
    expect(mapped.ctaCtr).toBe(11.9);
    expect(mapped.topConvertingBlock?.key).toBe("booking");
    expect(mapConversionMetrics({ views: 0, ctaClicks: 0, blockClicks: [] }).ctaCtr).toBeNull();
  });
});
