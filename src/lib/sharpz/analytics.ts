import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/src/lib/supabase/admin";

export type AnalyticsRankRow = { label: string; count: number };

export type TrafficSummary = {
  siteKey: string | null;
  installed: boolean;
  hasData: boolean;
  visitorsToday: number;
  visitors7d: number;
  visitors30d: number;
  sessions7d: number;
  pageviews7d: number;
  topPages: AnalyticsRankRow[];
  topReferrers: AnalyticsRankRow[];
  topSources: AnalyticsRankRow[];
  devices: AnalyticsRankRow[];
  countries: AnalyticsRankRow[];
  lastEventAt: string | null;
};

function asRows(value: unknown): AnalyticsRankRow[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      return {
        label: String(item.label ?? ""),
        count: Number(item.count ?? 0),
      };
    })
    .filter((row): row is AnalyticsRankRow => Boolean(row?.label));
}

function emptySummary(siteKey: string | null): TrafficSummary {
  return {
    siteKey,
    installed: Boolean(siteKey),
    hasData: false,
    visitorsToday: 0,
    visitors7d: 0,
    visitors30d: 0,
    sessions7d: 0,
    pageviews7d: 0,
    topPages: [],
    topReferrers: [],
    topSources: [],
    devices: [],
    countries: [],
    lastEventAt: null,
  };
}

function generateSiteKey() {
  return randomBytes(16).toString("hex");
}

export function sharpzAnalyticsSnippet(origin: string, siteKey: string) {
  return `<script async src="${origin}/sharpz.js" data-site="${siteKey}"></script>`;
}

export async function getOrCreateAnalyticsSite(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<{ siteKey: string; firstEventAt: string | null; lastEventAt: string | null }> {
  const { data: existing } = await supabase
    .from("analytics_sites")
    .select("site_key, first_event_at, last_event_at")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (existing?.site_key) {
    return {
      siteKey: String(existing.site_key),
      firstEventAt: existing.first_event_at ?? null,
      lastEventAt: existing.last_event_at ?? null,
    };
  }

  const siteKey = generateSiteKey();
  const { data, error } = await supabase
    .from("analytics_sites")
    .insert({ restaurant_id: restaurantId, site_key: siteKey })
    .select("site_key, first_event_at, last_event_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Impossible de créer le site analytics.");
  }

  await supabase.from("integrations").upsert(
    {
      restaurant_id: restaurantId,
      provider: "sharpz_analytics",
      status: "available",
      config: { site_key: siteKey },
    },
    { onConflict: "restaurant_id,provider" },
  );

  return {
    siteKey: String(data.site_key),
    firstEventAt: data.first_event_at ?? null,
    lastEventAt: data.last_event_at ?? null,
  };
}

export async function getTrafficSummary(
  supabase: SupabaseClient,
  restaurantId: string,
): Promise<TrafficSummary> {
  const site = await getOrCreateAnalyticsSite(supabase, restaurantId).catch(() => null);
  if (!site) return emptySummary(null);

  const { data, error } = await supabase.rpc("sharpz_analytics_traffic_summary", {
    p_restaurant_id: restaurantId,
  });

  if (error || !data) {
    return { ...emptySummary(site.siteKey), installed: true };
  }

  const raw = data as Record<string, unknown>;
  const visitors7d = Number(raw.visitors7d ?? 0);
  const pageviews7d = Number(raw.pageviews7d ?? 0);

  return {
    siteKey: site.siteKey,
    installed: true,
    hasData: visitors7d > 0 || pageviews7d > 0 || Boolean(raw.lastEventAt),
    visitorsToday: Number(raw.visitorsToday ?? 0),
    visitors7d,
    visitors30d: Number(raw.visitors30d ?? 0),
    sessions7d: Number(raw.sessions7d ?? 0),
    pageviews7d,
    topPages: asRows(raw.topPages),
    topReferrers: asRows(raw.topReferrers),
    topSources: asRows(raw.topSources),
    devices: asRows(raw.devices),
    countries: asRows(raw.countries),
    lastEventAt: typeof raw.lastEventAt === "string" ? raw.lastEventAt : null,
  };
}

export function parseDeviceType(userAgent: string | null): string {
  const ua = (userAgent ?? "").toLowerCase();
  if (!ua) return "unknown";
  if (/tablet|ipad/.test(ua)) return "tablet";
  if (/mobile|iphone|android/.test(ua)) return "mobile";
  return "desktop";
}

export function parseCountry(request: Request): string | null {
  const cf = request.headers.get("cf-ipcountry");
  if (cf && cf !== "XX") return cf;
  return null;
}

type CollectPayload = {
  siteKey: string;
  sessionId: string;
  visitorId: string;
  eventType?: string;
  path?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

export async function ingestAnalyticsEvent(request: Request, payload: CollectPayload) {
  const admin = createAdminClient();
  const { data: site } = await admin
    .from("analytics_sites")
    .select("restaurant_id, site_key")
    .eq("site_key", payload.siteKey)
    .maybeSingle();

  if (!site) return { ok: false as const, status: 404 };

  const now = new Date().toISOString();
  const { error } = await admin.from("analytics_events").insert({
    restaurant_id: site.restaurant_id,
    site_key: site.site_key,
    session_id: payload.sessionId.slice(0, 64),
    visitor_id: payload.visitorId.slice(0, 64),
    event_type: payload.eventType === "custom" ? "custom" : "pageview",
    path: payload.path?.slice(0, 500) ?? null,
    referrer: payload.referrer?.slice(0, 500) ?? null,
    utm_source: payload.utmSource?.slice(0, 120) ?? null,
    utm_medium: payload.utmMedium?.slice(0, 120) ?? null,
    utm_campaign: payload.utmCampaign?.slice(0, 120) ?? null,
    country: parseCountry(request),
    device_type: parseDeviceType(request.headers.get("user-agent")),
    created_at: now,
  });

  if (error) return { ok: false as const, status: 500 };

  const { data: siteMeta } = await admin
    .from("analytics_sites")
    .select("first_event_at")
    .eq("site_key", site.site_key)
    .maybeSingle();

  await admin
    .from("analytics_sites")
    .update({
      last_event_at: now,
      ...(siteMeta?.first_event_at ? {} : { first_event_at: now }),
    })
    .eq("site_key", site.site_key);

  await admin.from("integrations").upsert(
    {
      restaurant_id: site.restaurant_id,
      provider: "sharpz_analytics",
      status: "connected",
      connected_at: now,
      config: { site_key: site.site_key },
    },
    { onConflict: "restaurant_id,provider" },
  );

  return { ok: true as const, status: 204 };
}
