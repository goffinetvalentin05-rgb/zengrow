import { describe, expect, it } from "vitest";
import { coverCropRect, OFFER_BANNER_RATIO } from "@/src/lib/gift-vouchers/offers/crop-banner";

describe("coverCropRect", () => {
  it("recadre une image verticale sans étirement, au centre", () => {
    const rect = coverCropRect(800, 1600, OFFER_BANNER_RATIO, 0.5, 0.5);
    expect(rect.sw / rect.sh).toBeCloseTo(OFFER_BANNER_RATIO, 5);
    expect(rect.sx).toBe(0);
    expect(rect.sy).toBeCloseTo((1600 - rect.sh) / 2, 5);
  });

  it("recadre une image très large en coupant les côtés", () => {
    const rect = coverCropRect(3000, 1000, OFFER_BANNER_RATIO, 0.5, 0.5);
    expect(rect.sh).toBe(1000);
    expect(rect.sx).toBeGreaterThan(0);
  });

  it("honore le point focal à gauche", () => {
    const centered = coverCropRect(3000, 1000, OFFER_BANNER_RATIO, 0.5, 0.5);
    const left = coverCropRect(3000, 1000, OFFER_BANNER_RATIO, 0, 0.5);
    expect(left.sx).toBe(0);
    expect(left.sx).toBeLessThan(centered.sx);
  });
});
