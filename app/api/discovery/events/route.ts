import { NextResponse } from "next/server";
import { DISCOVERY_EVENT_TYPES, DISCOVERY_SOURCES } from "@/src/lib/discovery/constants";
import { sanitizeTrackingPlatform } from "@/src/lib/discovery/public-link";
import { createClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    profileId?: string;
    eventType?: string;
    source?: string;
    platform?: string;
    contentId?: string;
  };
  if (!body.profileId || !DISCOVERY_EVENT_TYPES.includes(body.eventType as (typeof DISCOVERY_EVENT_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  }
  const supabase = await createClient();
  const session = await supabase.auth.getUser();
  let visitorCategory: string | null = null;
  if (session.data.user) {
    const { data: mine } = await supabase
      .from("profiles")
      .select("id, primary_category_id, categories(slug)")
      .eq("user_id", session.data.user.id)
      .maybeSingle();
    const nested = mine as { id?: string; categories?: { slug: string } | { slug: string }[] | null } | null;
    if (nested?.id === body.profileId && body.eventType === "profile_view") {
      return NextResponse.json({ ok: true, skipped: "self" });
    }
    const cat = Array.isArray(nested?.categories) ? nested?.categories[0] : nested?.categories;
    visitorCategory = cat?.slug ?? null;
  }

  const { error } = await supabase.from("discovery_events").insert({
    profile_id: body.profileId,
    event_type: body.eventType,
    source: DISCOVERY_SOURCES.includes(body.source as (typeof DISCOVERY_SOURCES)[number]) ? body.source : "direct",
    platform: sanitizeTrackingPlatform(body.platform) ?? null,
    content_id: body.contentId ?? null,
    visitor_category_slug: visitorCategory,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
