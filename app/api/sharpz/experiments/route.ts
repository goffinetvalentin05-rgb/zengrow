import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const body = await parseJson<{ hypothesis?: string; actionId?: string; actionDescription?: string }>(request);
  const hypothesis = body?.hypothesis?.trim();
  if (!hypothesis) {
    return NextResponse.json({ error: "Hypothèse requise." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("experiments")
    .insert({
      restaurant_id: restaurant.id,
      hypothesis,
      action_id: body?.actionId ?? null,
      action_description: body?.actionDescription ?? null,
      status: "running",
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Impossible de créer l’expérimentation." }, { status: 400 });
  }
  return NextResponse.json({ id: data.id });
}
