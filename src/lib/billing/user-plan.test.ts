import { describe, expect, it } from "vitest";
import { isUserCheckoutProduct, shouldSyncUserSubscription } from "@/src/lib/billing/user-plan";

describe("user plan stripe routing", () => {
  it("accepts new learn checkouts and legacy discovery checkouts", () => {
    expect(isUserCheckoutProduct("learn")).toBe(true);
    expect(isUserCheckoutProduct("sharpz_discovery")).toBe(true);
    expect(isUserCheckoutProduct("starter")).toBe(false);
    expect(isUserCheckoutProduct(null)).toBe(false);
  });

  it("syncs subscription events for learn, discovery, or a user id", () => {
    expect(shouldSyncUserSubscription({ product: "learn", userId: "u1" })).toBe(true);
    expect(shouldSyncUserSubscription({ product: "sharpz_discovery", userId: "u1" })).toBe(true);
    expect(shouldSyncUserSubscription({ product: null, userId: "u1" })).toBe(true);
    expect(shouldSyncUserSubscription({ product: null, userId: null })).toBe(false);
  });
});
