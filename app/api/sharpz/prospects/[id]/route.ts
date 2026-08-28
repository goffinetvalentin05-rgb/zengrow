import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";

const STATUSES = new Set([
  "new",
  "to_contact",
  "contacted",
  "followed_up",
  "replied",
  "qualified",
  "not_relevant",
  "closed",
]);

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
    status?: string;
    lastAction?: string | null;
    contactedAt?: string | null;
    nextFollowUpAt?: string | null;
    notes?: string;
  }>(request);
  const patch: Record<string, unknown> = {};
  if (body?.status && STATUSES.has(body.status)) patch.status = body.status;
  if (typeof body?.notes === "string") patch.notes = body.notes;
  if (body?.type) patch.prospect_type = body.type;
  if (body?.name !== undefined) patch.name = body.name?.trim() || null;
  if (typeof body?.company === "string" && body.company.trim()) patch.company = body.company.trim();
  if (body?.email !== undefined) patch.email = body.email?.trim() || null;
  if (body?.phone !== undefined) patch.phone = body.phone?.trim() || null;
  if (body?.url !== undefined) patch.url = body.url?.trim() || null;
  if (body?.source !== undefined) patch.source = body.source?.trim() || null;
  if (body?.lastAction !== undefined) patch.last_action = body.lastAction?.trim() || null;
  if (body?.contactedAt !== undefined) patch.contacted_at = body.contactedAt || null;
  if (body?.nextFollowUpAt !== undefined) patch.next_follow_up_at = body.nextFollowUpAt || null;

  const { data } = await supabase
    .from("prospects")
    .select("id")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();
  if (!data) return NextResponse.json({ error: "Prospect introuvable." }, { status: 404 });

  const { error } = await supabase.from("prospects").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
