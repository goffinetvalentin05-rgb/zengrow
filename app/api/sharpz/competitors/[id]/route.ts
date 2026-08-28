import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const { id } = await ctx.params;
  const body = await parseJson<{
    name?: string;
    url?: string | null;
    pricingUrl?: string | null;
    notes?: string | null;
    positioning?: string | null;
    pricing?: string | null;
    active?: boolean;
  }>(request);

  const patch: Record<string, unknown> = {};
  if (typeof body?.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (body && "url" in body) patch.url = body.url?.trim() || null;
  if (body && "pricingUrl" in body) patch.pricing_url = body.pricingUrl?.trim() || null;
  if (body && "notes" in body) patch.notes = body.notes?.trim() || null;
  if (body && "positioning" in body) patch.positioning = body.positioning;
  if (body && "pricing" in body) patch.pricing = body.pricing;
  if (typeof body?.active === "boolean") {
    patch.active = body.active;
    if (!body.active) patch.status = "paused";
    else patch.status = "watching";
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Aucun champ à mettre à jour." }, { status: 400 });
  }

  const { error } = await supabase
    .from("competitors")
    .update(patch)
    .eq("id", id)
    .eq("restaurant_id", restaurant.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
