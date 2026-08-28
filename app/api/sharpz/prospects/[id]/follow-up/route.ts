import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import {
  defaultNextFollowUpAfterContact,
  isEligibleForFollowUpReminder,
  nextStatusAfterFollowUp,
} from "@/src/lib/sharpz/follow-ups";
import { followUpIso, followUpIsoFromDateInput, isScriptChannel } from "@/src/lib/sharpz/outreach";
import { logProspectEvent } from "@/src/lib/sharpz/prospect-events";
import { isPipelineStatus } from "@/src/lib/sharpz/prospects-pipeline";

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("completed"),
    channel: z.string().optional(),
    note: z.string().max(1000).optional(),
    daysFromNow: z.number().int().min(1).max(90).optional(),
    nextFollowUpAt: z.string().optional(),
  }),
  z.object({
    action: z.literal("snooze"),
    daysFromNow: z.number().int().min(1).max(90).optional(),
    nextFollowUpAt: z.string().optional(),
    note: z.string().max(1000).optional(),
  }),
]);

function resolveNextFollowUpAt(input: {
  daysFromNow?: number;
  nextFollowUpAt?: string;
  fallbackDays: number;
}) {
  if (input.nextFollowUpAt?.trim()) {
    const fromDate = followUpIsoFromDateInput(input.nextFollowUpAt.trim());
    if (fromDate) return fromDate;
    const parsed = new Date(input.nextFollowUpAt);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(12, 0, 0, 0);
      return parsed.toISOString();
    }
  }
  if (input.daysFromNow != null) return followUpIso(input.daysFromNow);
  return defaultNextFollowUpAfterContact(input.fallbackDays);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const { id } = await context.params;
  const raw = await parseJson<unknown>(request);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête relance invalide." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("prospects")
    .select("id, status, company, name, contacted_at, next_follow_up_at")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Prospect introuvable." }, { status: 404 });
  }
  if (!isEligibleForFollowUpReminder(String(existing.status))) {
    return NextResponse.json(
      { error: "Ce prospect (client / fermé) n’entre pas dans les relances Dashboard." },
      { status: 400 },
    );
  }

  const body = parsed.data;

  if (body.action === "snooze") {
    const nextFollowUpAt = resolveNextFollowUpAt({
      daysFromNow: body.daysFromNow,
      nextFollowUpAt: body.nextFollowUpAt,
      fallbackDays: 3,
    });
    const { error } = await supabase
      .from("prospects")
      .update({ next_follow_up_at: nextFollowUpAt })
      .eq("id", id)
      .eq("restaurant_id", restaurant.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await logProspectEvent(supabase, {
      restaurantId: restaurant.id,
      prospectId: id,
      eventType: "note",
      detail: body.note?.trim() || "Relance reportée depuis Dashboard",
      meta: { source: "dashboard_follow_up", action: "snooze", nextFollowUpAt },
    });

    return NextResponse.json({ ok: true, nextFollowUpAt });
  }

  const channel = body.channel && isScriptChannel(body.channel) ? body.channel : null;
  const nextStatus = nextStatusAfterFollowUp(String(existing.status));
  const nextFollowUpAt = resolveNextFollowUpAt({
    daysFromNow: body.daysFromNow,
    nextFollowUpAt: body.nextFollowUpAt,
    fallbackDays: 3,
  });
  const nowIso = new Date().toISOString();
  const detail =
    body.note?.trim() ||
    (channel ? `Relance effectuée (${channel})` : "Relance effectuée depuis Dashboard");

  const patch: Record<string, unknown> = {
    contacted_at: nowIso,
    last_action: detail,
    next_follow_up_at: nextFollowUpAt,
  };
  if (isPipelineStatus(String(nextStatus)) && nextStatus !== existing.status) {
    patch.status = nextStatus;
  }

  const { error } = await supabase
    .from("prospects")
    .update(patch)
    .eq("id", id)
    .eq("restaurant_id", restaurant.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (patch.status && patch.status !== existing.status) {
    await logProspectEvent(supabase, {
      restaurantId: restaurant.id,
      prospectId: id,
      eventType: "status_change",
      detail: `${existing.status} → ${patch.status}`,
      meta: { from: existing.status, to: patch.status, source: "dashboard_follow_up" },
    });
  }

  await logProspectEvent(supabase, {
    restaurantId: restaurant.id,
    prospectId: id,
    eventType: "contact",
    detail,
    meta: {
      source: "dashboard_follow_up",
      action: "completed",
      channel,
      nextFollowUpAt,
    },
  });

  return NextResponse.json({
    ok: true,
    status: patch.status ?? existing.status,
    nextFollowUpAt,
    contactedAt: nowIso,
  });
}
