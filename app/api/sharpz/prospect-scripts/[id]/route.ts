import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { isScriptChannel, isScriptStage, mapProspectScript } from "@/src/lib/sharpz/outreach";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const { id } = await context.params;
  const body = await parseJson<{
    name?: string;
    channel?: string;
    stage?: string;
    content?: string;
    notes?: string | null;
    isActive?: boolean;
  }>(request);

  const { data: existing } = await supabase
    .from("prospect_scripts")
    .select("id")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Script introuvable." }, { status: 404 });

  const patch: Record<string, unknown> = {};
  if (typeof body?.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body?.content === "string" && body.content.trim()) patch.content = body.content.trim();
  if (body?.notes !== undefined) patch.notes = body.notes?.trim() || null;
  if (typeof body?.isActive === "boolean") patch.is_active = body.isActive;
  if (body?.channel) {
    if (!isScriptChannel(body.channel)) return NextResponse.json({ error: "Canal invalide." }, { status: 400 });
    patch.channel = body.channel;
  }
  if (body?.stage) {
    if (!isScriptStage(body.stage)) return NextResponse.json({ error: "Étape invalide." }, { status: 400 });
    patch.stage = body.stage;
  }

  const { data, error } = await supabase
    .from("prospect_scripts")
    .update(patch)
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .select("*")
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: error?.message ?? "Erreur." }, { status: 400 });
  return NextResponse.json({ script: mapProspectScript(data as Record<string, unknown>) });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const { id } = await context.params;

  const { data: existing } = await supabase
    .from("prospect_scripts")
    .select("id")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();
  if (!existing) return NextResponse.json({ error: "Script introuvable." }, { status: 404 });

  const { error } = await supabase
    .from("prospect_scripts")
    .delete()
    .eq("id", id)
    .eq("restaurant_id", restaurant.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
