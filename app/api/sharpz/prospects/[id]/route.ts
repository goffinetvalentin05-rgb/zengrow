import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { logProspectEvent } from "@/src/lib/sharpz/prospect-events";
import { isPipelineStatus } from "@/src/lib/sharpz/prospects-pipeline";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const { id } = await context.params;
  const body = await parseJson<{
    type?: "company" | "individual";
    name?: string | null;
    company?: string;
    email?: string | null;
    phone?: string | null;
    url?: string | null;
    source?: string | null;
    contact?: string | null;
    status?: string;
    lastAction?: string | null;
    contactedAt?: string | null;
    nextFollowUpAt?: string | null;
    notes?: string;
    linkedinUrl?: string | null;
    instagramUrl?: string | null;
  }>(request);

  const { data: existing } = await supabase
    .from("prospects")
    .select("id, status, notes, contacted_at, last_action")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Prospect introuvable." }, { status: 404 });

  const patch: Record<string, unknown> = {};
  if (body?.status && isPipelineStatus(body.status)) patch.status = body.status;
  if (typeof body?.notes === "string") patch.notes = body.notes;
  if (body?.type) patch.prospect_type = body.type;
  if (body?.name !== undefined) patch.name = body.name?.trim() || null;
  if (typeof body?.company === "string" && body.company.trim()) patch.company = body.company.trim();
  if (body?.email !== undefined) patch.email = body.email?.trim() || null;
  if (body?.phone !== undefined) patch.phone = body.phone?.trim() || null;
  if (body?.url !== undefined) patch.url = body.url?.trim() || null;
  if (body?.source !== undefined) patch.source = body.source?.trim() || null;
  if (body?.contact !== undefined) patch.contact = body.contact?.trim() || null;
  if (body?.lastAction !== undefined) patch.last_action = body.lastAction?.trim() || null;
  if (body?.contactedAt !== undefined) patch.contacted_at = body.contactedAt || null;
  if (body?.nextFollowUpAt !== undefined) patch.next_follow_up_at = body.nextFollowUpAt || null;
  if (body?.linkedinUrl !== undefined) patch.linkedin_url = body.linkedinUrl?.trim() || null;
  if (body?.instagramUrl !== undefined) patch.instagram_url = body.instagramUrl?.trim() || null;

  const { error } = await supabase.from("prospects").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (body?.status && body.status !== existing.status && isPipelineStatus(body.status)) {
    await logProspectEvent(supabase, {
      restaurantId: restaurant.id,
      prospectId: id,
      eventType: "status_change",
      detail: `${existing.status} → ${body.status}`,
      meta: { from: existing.status, to: body.status },
    });
  }

  if (typeof body?.notes === "string" && body.notes !== (existing.notes ?? "")) {
    await logProspectEvent(supabase, {
      restaurantId: restaurant.id,
      prospectId: id,
      eventType: "note",
      detail: body.notes.trim() || "Note mise à jour",
    });
  }

  if (body?.lastAction?.trim() && body.lastAction.trim() !== (existing.last_action ?? "")) {
    await logProspectEvent(supabase, {
      restaurantId: restaurant.id,
      prospectId: id,
      eventType: "contact",
      detail: body.lastAction.trim(),
    });
  } else if (body?.contactedAt && body.contactedAt !== existing.contacted_at) {
    await logProspectEvent(supabase, {
      restaurantId: restaurant.id,
      prospectId: id,
      eventType: "contact",
      detail: "Contact enregistré",
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const { id } = await context.params;

  const { data: existing } = await supabase
    .from("prospects")
    .select("id")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Prospect introuvable." }, { status: 404 });

  const { error } = await supabase.from("prospects").delete().eq("id", id).eq("restaurant_id", restaurant.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
