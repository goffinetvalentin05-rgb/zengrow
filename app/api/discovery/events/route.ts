import { NextResponse } from "next/server";
import { DISCOVERY_EVENT_TYPES } from "@/src/lib/discovery/constants";
import { recordDiscoveryEvent } from "@/src/lib/discovery/track-server";
import { createClient } from "@/src/lib/supabase/server";

type EventBody = {
  profileId?: string;
  eventType?: string;
  source?: string;
  platform?: string;
  contentId?: string;
  destination?: string;
  visitorToken?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrerHost?: string;
};

function isEventBody(value: unknown): value is EventBody {
  return Boolean(value && typeof value === "object");
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as EventBody & { events?: EventBody[] };
  const batch = Array.isArray(payload.events) ? payload.events.slice(0, 24) : [payload];
  if (!batch.length) return NextResponse.json({ error: "Invalid event." }, { status: 400 });

  const supabase = await createClient();
  const session = await supabase.auth.getUser();
  let visitorProfileId: string | null = null;
  if (session.data.user) {
    const { data: mine } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.data.user.id)
      .maybeSingle();
    visitorProfileId = mine?.id ?? null;
  }

  for (const body of batch) {
    if (!isEventBody(body) || !body.profileId || !DISCOVERY_EVENT_TYPES.includes(body.eventType as (typeof DISCOVERY_EVENT_TYPES)[number])) {
      continue;
    }
    if (visitorProfileId && visitorProfileId === body.profileId && body.eventType === "profile_view") {
      continue;
    }
    const result = await recordDiscoveryEvent(supabase, {
      profileId: body.profileId,
      eventType: body.eventType!,
      source: body.source,
      platform: body.platform,
      contentId: body.contentId,
      visitorToken: body.visitorToken,
      visitorProfileId,
      destination: body.destination,
      utmSource: body.utmSource,
      utmMedium: body.utmMedium,
      utmCampaign: body.utmCampaign,
      referrerHost: body.referrerHost,
    });
    if (!result.ok && batch.length === 1) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
