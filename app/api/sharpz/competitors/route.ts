import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const body = await parseJson<{ name?: string; url?: string; positioning?: string; pricing?: string }>(request);
  const name = body?.name?.trim();
  if (!name) return NextResponse.json({ error: "Nom requis." }, { status: 400 });

  const { data, error } = await supabase
    .from("competitors")
    .insert({
      restaurant_id: restaurant.id,
      name,
      url: body?.url?.trim() || null,
      positioning: body?.positioning ?? null,
      pricing: body?.pricing ?? null,
      status: "watching",
      last_checked_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Impossible d’ajouter le concurrent." }, { status: 400 });
  }
  return NextResponse.json({ id: data.id });
}
