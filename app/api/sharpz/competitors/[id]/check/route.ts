import { NextResponse } from "next/server";
import { requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { checkCompetitor, type CompetitorWatchRow } from "@/src/lib/sharpz/competitor-watch/check";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const { id } = await ctx.params;

  const { data, error } = await supabase
    .from("competitors")
    .select("id, name, url, pricing_url, positioning, pricing, notes, active, status, last_checked_at")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "Concurrent introuvable." }, { status: 404 });
  }

  const row: CompetitorWatchRow = {
    id: String(data.id),
    name: String(data.name),
    url: data.url ?? null,
    pricing_url: data.pricing_url ?? null,
    positioning: data.positioning ?? null,
    pricing: data.pricing ?? null,
    notes: data.notes ?? null,
    active: data.active !== false,
    status: String(data.status ?? "watching"),
    last_checked_at: data.last_checked_at ?? null,
  };

  const result = await checkCompetitor(supabase, restaurant.id, row);
  return NextResponse.json(result);
}
