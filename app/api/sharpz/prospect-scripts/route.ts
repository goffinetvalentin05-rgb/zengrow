import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import {
  isScriptChannel,
  isScriptStage,
  mapProspectScript,
} from "@/src/lib/sharpz/outreach";
import { ensureDefaultProspectScripts } from "@/src/lib/sharpz/queries";

export async function GET() {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  await ensureDefaultProspectScripts(supabase, restaurant.id);
  const { data, error } = await supabase
    .from("prospect_scripts")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("channel", { ascending: true })
    .order("stage", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({
    scripts: (data ?? []).map((row) => mapProspectScript(row as Record<string, unknown>)),
  });
}

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const body = await parseJson<{
    name?: string;
    channel?: string;
    stage?: string;
    content?: string;
    notes?: string | null;
    isActive?: boolean;
  }>(request);

  const name = body?.name?.trim();
  const content = body?.content?.trim();
  if (!name || !content) {
    return NextResponse.json({ error: "Nom et contenu requis." }, { status: 400 });
  }
  if (!body?.channel || !isScriptChannel(body.channel)) {
    return NextResponse.json({ error: "Canal invalide." }, { status: 400 });
  }
  if (!body?.stage || !isScriptStage(body.stage)) {
    return NextResponse.json({ error: "Étape invalide." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("prospect_scripts")
    .insert({
      restaurant_id: restaurant.id,
      name,
      channel: body.channel,
      stage: body.stage,
      content,
      notes: body.notes?.trim() || null,
      is_active: body.isActive !== false,
    })
    .select("*")
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: error?.message ?? "Erreur." }, { status: 400 });
  return NextResponse.json({ script: mapProspectScript(data as Record<string, unknown>) });
}
