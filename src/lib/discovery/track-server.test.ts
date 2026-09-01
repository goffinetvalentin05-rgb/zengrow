import { describe, expect, it } from "vitest";
import { isSelfDiscoveryTraffic } from "@/src/lib/discovery/track-server";

describe("self-traffic exclusion", () => {
  it("skips when the visitor owns the profile", () => {
    expect(isSelfDiscoveryTraffic("profile-a", "profile-a")).toBe(true);
  });

  it("tracks a different signed-in visitor", () => {
    expect(isSelfDiscoveryTraffic("profile-a", "profile-b")).toBe(false);
  });

  it("tracks anonymous visitors", () => {
    expect(isSelfDiscoveryTraffic("profile-a", null)).toBe(false);
    expect(isSelfDiscoveryTraffic("profile-a", undefined)).toBe(false);
    expect(isSelfDiscoveryTraffic("profile-a", "")).toBe(false);
  });
});
