import { describe, expect, it } from "vitest";
import {
  clickThroughRate,
  discoveryConversion,
  followConversion,
  formatDelta,
  mapProfileAnalytics,
  parseAnalyticsRange,
  percentChange,
  topLinkLabel,
  trafficSourceLabel,
  withTrafficShares,
} from "@/src/lib/discovery/analytics";
import { connectionStatusForViewer, isUuid } from "@/src/lib/discovery/connections";

describe("analytics helpers", () => {
  it("parses allowed ranges only", () => {
    expect(parseAnalyticsRange(7)).toBe(7);
    expect(parseAnalyticsRange("90")).toBe(90);
    expect(parseAnalyticsRange("12")).toBe(30);
    expect(parseAnalyticsRange(null)).toBe(30);
  });

  it("computes CTR and conversions from real counts", () => {
    expect(clickThroughRate(54, 428)).toBe(12.6);
    expect(clickThroughRate(0, 10)).toBe(0);
    expect(clickThroughRate(4, 0)).toBeNull();
    expect(discoveryConversion(318, 2481)).toBe(12.8);
    expect(followConversion(41, 318)).toBe(12.9);
  });

  it("returns null percent change when the previous period is empty", () => {
    expect(percentChange(10, 0)).toBeNull();
    expect(percentChange(118, 100)).toBe(18);
    expect(formatDelta(18)).toBe("+18%");
    expect(formatDelta(-12)).toBe("-12%");
  });

  it("labels traffic sources including UTM bios", () => {
    expect(trafficSourceLabel("instagram_bio")).toBe("Instagram bio");
    expect(trafficSourceLabel("explore")).toBe("Sharpz Explore");
    expect(trafficSourceLabel("direct")).toBe("Direct link");
    const shares = withTrafficShares([
      { key: "instagram_bio", count: 43 },
      { key: "direct", count: 28 },
      { key: "explore", count: 19 },
      { key: "youtube", count: 10 },
    ]);
    expect(shares[0]).toEqual({ key: "instagram_bio", count: 43, share: 43 });
  });

  it("maps RPC payloads without inventing metrics", () => {
    const mapped = mapProfileAnalytics({
      range_days: 7,
      views: 12,
      unique_visitors: 4,
      external_clicks: 3,
      traffic_sources: [{ key: "explore", count: 8 }],
    });
    expect(mapped.views).toBe(12);
    expect(mapped.unique_visitors).toBe(4);
    expect(mapped.followers_total).toBe(0);
    expect(mapped.traffic_sources[0]?.share).toBe(100);
  });

  it("formats top links from stored titles", () => {
    expect(
      topLinkLabel({
        label: "How I built X",
        platform: "youtube",
        kind: "featured",
        clicks: 82,
      }),
    ).toBe("YouTube — How I built X");
  });
});

describe("connections", () => {
  it("maps a pending request to accept/requested from the viewer side", () => {
    expect(
      connectionStatusForViewer("a", { requester_id: "a", receiver_id: "b", status: "pending" }),
    ).toBe("pending_out");
    expect(
      connectionStatusForViewer("b", { requester_id: "a", receiver_id: "b", status: "pending" }),
    ).toBe("pending_in");
    expect(
      connectionStatusForViewer("a", { requester_id: "a", receiver_id: "b", status: "accepted" }),
    ).toBe("accepted");
    expect(connectionStatusForViewer("a", { requester_id: "a", receiver_id: "b", status: "declined" })).toBe("none");
  });

  it("rejects self ids that are not uuids", () => {
    expect(isUuid("not-a-uuid")).toBe(false);
    expect(isUuid("11111111-1111-4111-8111-111111111111")).toBe(true);
  });
});
