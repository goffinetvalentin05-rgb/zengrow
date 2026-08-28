import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { logProspectEvent } from "@/src/lib/sharpz/prospect-events";
import { isScriptChannel, isScriptStage } from "@/src/lib/sharpz/outreach";
import { isPipelineStatus } from "@/src/lib/sharpz/prospects-pipeline";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const { id } = await context.params;
  const body = await parseJson<{
    channel?: string;
    scriptId?: string | null;
    scriptName?: string | null;
    stage?: string | null;
    detail?: string | null;
    comment?: string | null;
    lastAction?: string | null;
    markContacted?: boolean;
    nextStatus?: string | null;
  }>(request);

  if (!body?.channel || !isScriptChannel(body.channel)) {
    return NextResponse.json({ error: "Canal invalide." }, { status: 400 });
  }
  if (body.stage && !isScriptStage(body.stage)) {
    return NextResponse.json({ error: "Étape invalide." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("prospects")
    .select("id, status, contacted_at")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Prospect introuvable." }, { status: 404 });

  const detail = [body.detail?.trim(), body.comment?.trim()].filter(Boolean).join(" — ") || "Contact enregistré";
  const lastAction = body.lastAction?.trim() || detail;
  const patch: Record<string, unknown> = { last_action: lastAction };
  if (body.markContacted !== false) {
    patch.contacted_at = existing.contacted_at || new Date().toISOString();
  }
  if (body.nextStatus && isPipelineStatus(body.nextStatus) && body.nextStatus !== existing.status) {
    patch.status = body.nextStatus;
  } else if (existing.status === "to_contact") {
    patch.status = "follow_up_1";
  }

  const { error } = await supabase.from("prospects").update(patch).eq("id", id).eq("restaurant_id", restaurant.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const event = await logProspectEvent(supabase, {
    restaurantId: restaurant.id,
    prospectId: id,
    eventType: "contact",
    detail,
    meta: {
      channel: body.channel,
      scriptId: body.scriptId ?? null,
      scriptName: body.scriptName ?? null,
      stage: body.stage ?? null,
    },
  });

  return NextResponse.json({ ok: true, event, status: patch.status ?? existing.status });
}
