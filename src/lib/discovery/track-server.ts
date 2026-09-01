import { createHash } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DISCOVERY_EVENT_TYPES, DISCOVERY_SOURCES } from "@/src/lib/discovery/constants";
import { sanitizeTrackingPlatform } from "@/src/lib/discovery/public-link";

const VISITOR_SALT = process.env.DISCOVERY_VISITOR_SALT?.trim() || "sharpz-discovery-visitor-v1";

export function hashVisitorKey(token: string, profileId: string) {
  const clean = token.trim().slice(0, 80);
  if (!clean) return null;
  return createHash("sha256").update(`${VISITOR_SALT}:${clean}:${profileId}`).digest("hex").slice(0, 32);
}

export function normalizeDiscoverySource(value: string | null | undefined) {
  if (!value) return "direct";
  const cleaned = value.trim().toLowerCase();
  if (DISCOVERY_SOURCES.includes(cleaned as (typeof DISCOVERY_SOURCES)[number])) return cleaned;
  if (["instagram", "youtube", "tiktok", "x", "linkedin", "website", "other"].includes(cleaned)) {
    return cleaned;
  }
  return "direct";
}

type TrackInput = {
  profileId: string;
  eventType: string;
  source?: string | null;
  platform?: string | null;
  contentId?: string | null;
  visitorToken?: string | null;
  visitorProfileId?: string | null;
  destination?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  referrerHost?: string | null;
};

export async function recordDiscoveryEvent(supabase: SupabaseClient, input: TrackInput) {
  if (!DISCOVERY_EVENT_TYPES.includes(input.eventType as (typeof DISCOVERY_EVENT_TYPES)[number])) {
    return { ok: false as const, error: "Invalid event." };
  }
  const visitorSeed = input.visitorProfileId || input.visitorToken || null;
  const { data, error } = await supabase.rpc("discovery_track_event", {
    p_profile_id: input.profileId,
    p_event_type: input.eventType,
    p_source: normalizeDiscoverySource(input.source),
    p_platform: sanitizeTrackingPlatform(input.platform),
    p_content_id: input.contentId ?? null,
    p_visitor_key: visitorSeed ? hashVisitorKey(visitorSeed, input.profileId) : null,
    p_destination: input.destination?.slice(0, 500) ?? null,
    p_utm_source: sanitizeTrackingPlatform(input.utmSource),
    p_utm_medium: sanitizeTrackingPlatform(input.utmMedium),
    p_referrer_host: input.referrerHost?.slice(0, 120) ?? null,
  });
  if (!error) {
    const payload = data as { ok?: boolean; skipped?: string; error?: string } | null;
    if (payload && payload.ok === false) return { ok: false as const, error: payload.error ?? "Rejected." };
    return { ok: true as const, skipped: payload?.skipped ?? null };
  }

  const fallback = await supabase.from("discovery_events").insert({
    profile_id: input.profileId,
    event_type: input.eventType,
    source: normalizeDiscoverySource(input.source),
    platform: sanitizeTrackingPlatform(input.platform),
    content_id: input.contentId ?? null,
  });
  if (fallback.error) return { ok: false as const, error: fallback.error.message };
  return { ok: true as const, skipped: null };
}
