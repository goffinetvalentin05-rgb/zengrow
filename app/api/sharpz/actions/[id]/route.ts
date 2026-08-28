import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { computeSharpzScore } from "@/src/lib/sharpz/scoring";

const STATUSES = new Set(["todo", "in_progress", "done", "ignored"]);

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const { id } = await context.params;
  const body = await parseJson<{ status?: string; impact?: number; effort?: number; confidence?: number }>(request);

  const { data: existing } = await supabase
    .from("actions")
    .select("id, impact, effort, confidence")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Action introuvable." }, { status: 404 });
  }

  const patch: Record<string, unknown> = {};
  if (body?.status && STATUSES.has(body.status)) patch.status = body.status;
  if (typeof body?.impact === "number") patch.impact = body.impact;
  if (typeof body?.effort === "number") patch.effort = body.effort;
  if (typeof body?.confidence === "number") patch.confidence = body.confidence;

  if (patch.impact != null || patch.effort != null || patch.confidence != null) {
    patch.score = computeSharpzScore(
      Number(patch.impact ?? existing.impact),
      Number(patch.effort ?? existing.effort),
      Number(patch.confidence ?? existing.confidence),
    );
  }

  const { error } = await supabase.from("actions").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
