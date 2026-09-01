import { ANALYTICS_RANGES, SOCIAL_PLATFORM_LABELS, type AnalyticsRange, type SocialPlatform } from "@/src/lib/discovery/constants";
import type { ProfileAnalytics } from "@/src/lib/discovery/types";

export const TRAFFIC_SOURCE_LABELS: Record<string, string> = {
  explore: "Sharpz Explore",
  search: "Sharpz Search",
  category: "Category",
  direct: "Direct link",
  following: "Following",
  saved: "Saved",
  instagram: "Instagram",
  instagram_bio: "Instagram bio",
  youtube: "YouTube",
  youtube_bio: "YouTube",
  tiktok: "TikTok",
  tiktok_bio: "TikTok",
  x: "X",
  x_bio: "X",
  linkedin: "LinkedIn",
  linkedin_bio: "LinkedIn bio",
  website: "Website",
  other: "Other",
};

export const PLATFORM_LABELS: Record<string, string> = {
  ...SOCIAL_PLATFORM_LABELS,
  project: "Project",
  featured_content: "Featured content",
  article: "Article",
  other: "Other",
};

const EMPTY_ANALYTICS: ProfileAnalytics = {
  range_days: 30,
  views_total: 0,
  views: 0,
  views_prev: 0,
  views_today: 0,
  views_7d: 0,
  views_30d: 0,
  unique_visitors: 0,
  unique_visitors_prev: 0,
  external_clicks: 0,
  external_clicks_prev: 0,
  external_clicks_total: 0,
  impressions: 0,
  profile_opens: 0,
  follows: 0,
  clicks_by_platform: {},
  sources: {},
  traffic_sources: [],
  visitor_niches: [],
  new_followers_7d: 0,
  new_followers_30d: 0,
  new_followers: 0,
  followers_total: 0,
  views_over_time: [],
  followers_over_time: [],
  top_links: [],
  most_clicked_content: [],
};

function asNumber(value: unknown, fallback = 0) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function parseAnalyticsRange(value: string | number | null | undefined): AnalyticsRange {
  const n = typeof value === "number" ? value : Number(value);
  if (ANALYTICS_RANGES.includes(n as AnalyticsRange)) return n as AnalyticsRange;
  return 30;
}

export function percentChange(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}

export function clickThroughRate(clicks: number, views: number): number | null {
  if (views <= 0) return null;
  return Math.round((clicks / views) * 1000) / 10;
}

export function discoveryConversion(opens: number, impressions: number): number | null {
  if (impressions <= 0) return null;
  return Math.round((opens / impressions) * 1000) / 10;
}

export function followConversion(follows: number, opens: number): number | null {
  if (opens <= 0) return null;
  return Math.round((follows / opens) * 1000) / 10;
}

export function formatDelta(delta: number | null) {
  if (delta == null) return null;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta}%`;
}

export function trafficSourceLabel(key: string) {
  return TRAFFIC_SOURCE_LABELS[key] ?? (SOCIAL_PLATFORM_LABELS[key as SocialPlatform] ?? key);
}

export function platformLabel(key: string) {
  return PLATFORM_LABELS[key] ?? key;
}

export function withTrafficShares(
  rows: { key: string; count: number }[],
): { key: string; count: number; share: number }[] {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  if (!total) return rows.map((row) => ({ ...row, share: 0 }));
  return rows
    .map((row) => ({
      ...row,
      share: Math.round((row.count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export function mapProfileAnalytics(raw: unknown, rangeDays: AnalyticsRange = 30): ProfileAnalytics {
  if (!raw || typeof raw !== "object") return { ...EMPTY_ANALYTICS, range_days: rangeDays };
  const row = raw as Record<string, unknown>;
  const traffic = Array.isArray(row.traffic_sources)
    ? withTrafficShares(
        (row.traffic_sources as { key?: string; count?: number }[])
          .filter((item) => item?.key)
          .map((item) => ({ key: String(item.key), count: asNumber(item.count) })),
      )
    : [];

  return {
    range_days: asNumber(row.range_days, rangeDays) as AnalyticsRange,
    views_total: asNumber(row.views_total),
    views: asNumber(row.views, asNumber(row.views_30d)),
    views_prev: asNumber(row.views_prev),
    views_today: asNumber(row.views_today),
    views_7d: asNumber(row.views_7d),
    views_30d: asNumber(row.views_30d),
    unique_visitors: asNumber(row.unique_visitors),
    unique_visitors_prev: asNumber(row.unique_visitors_prev),
    external_clicks: asNumber(row.external_clicks),
    external_clicks_prev: asNumber(row.external_clicks_prev),
    external_clicks_total: asNumber(row.external_clicks_total, asNumber(row.external_clicks)),
    impressions: asNumber(row.impressions),
    profile_opens: asNumber(row.profile_opens),
    follows: asNumber(row.follows),
    clicks_by_platform: (row.clicks_by_platform as Record<string, number>) ?? {},
    sources: (row.sources as Record<string, number>) ?? {},
    traffic_sources: traffic,
    visitor_niches: Array.isArray(row.visitor_niches)
      ? (row.visitor_niches as ProfileAnalytics["visitor_niches"])
      : [],
    new_followers_7d: asNumber(row.new_followers_7d),
    new_followers_30d: asNumber(row.new_followers_30d),
    new_followers: asNumber(row.new_followers, asNumber(row.new_followers_30d)),
    followers_total: asNumber(row.followers_total),
    views_over_time: Array.isArray(row.views_over_time) ? (row.views_over_time as ProfileAnalytics["views_over_time"]) : [],
    followers_over_time: Array.isArray(row.followers_over_time)
      ? (row.followers_over_time as ProfileAnalytics["followers_over_time"])
      : [],
    top_links: Array.isArray(row.top_links) ? (row.top_links as ProfileAnalytics["top_links"]) : [],
    most_clicked_content: Array.isArray(row.most_clicked_content)
      ? (row.most_clicked_content as ProfileAnalytics["most_clicked_content"])
      : [],
  };
}

export function emptyProfileAnalytics(rangeDays: AnalyticsRange = 30): ProfileAnalytics {
  return { ...EMPTY_ANALYTICS, range_days: rangeDays };
}

export function topLinkLabel(item: ProfileAnalytics["top_links"][number]) {
  if (item.kind === "featured") {
    return item.label ? `${platformLabel(item.platform)} — ${item.label}` : platformLabel(item.platform);
  }
  if (item.kind === "project") return item.label || "Project";
  if (item.platform && item.platform !== "other" && item.label === item.platform) {
    return platformLabel(item.platform);
  }
  if (item.platform && item.platform !== "other") {
    try {
      const host = item.label.startsWith("http") ? new URL(item.label).hostname.replace(/^www\./, "") : item.label;
      if (host && host !== item.platform) return `${platformLabel(item.platform)} — ${host}`;
    } catch {
      if (item.label && item.label !== item.platform) return `${platformLabel(item.platform)} — ${item.label}`;
    }
    return platformLabel(item.platform);
  }
  return item.label || platformLabel(item.platform);
}
