import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";

const STATUSES = new Set(["new", "to_contact", "contacted", "replied", "qualified", "customer", "refused"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const { id } = await context.params;
  const body = await parseJson<{ status?: string; notes?: string }>(request);
  const patch: Record<string, unknown> = {};
  if (body?.status && STATUSES.has(body.status)) patch.status = body.status;
  if (typeof body?.notes === "string") patch.notes = body.notes;

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
