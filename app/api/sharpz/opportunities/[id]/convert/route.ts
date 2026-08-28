import { NextResponse } from "next/server";
import { requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { computeSharpzScore } from "@/src/lib/sharpz/scoring";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const { id } = await context.params;

  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  if (!opportunity) {
    return NextResponse.json({ error: "Opportunité introuvable." }, { status: 404 });
  }

  if (opportunity.converted_action_id) {
    return NextResponse.json({ actionId: opportunity.converted_action_id, alreadyConverted: true });
  }

  const impact = Number(opportunity.potential ?? 7);
  const effort = Number(opportunity.effort ?? 5);
  const confidence = Number(opportunity.confidence ?? 60);

  const { data: action, error } = await supabase
    .from("actions")
    .insert({
      restaurant_id: restaurant.id,
      title: opportunity.name,
      category: opportunity.category,
      status: "todo",
      impact,
      effort,
      confidence,
      score: computeSharpzScore(impact, effort, confidence),
      why: opportunity.why_detected ?? opportunity.explanation,
      how_to: opportunity.explanation,
      micro_steps: [],
      source_type: "opportunity",
      source_id: opportunity.id,
      opportunity_id: opportunity.id,
    })
    .select("id")
    .single();

  if (error || !action) {
    return NextResponse.json({ error: error?.message ?? "Impossible de créer l’action." }, { status: 400 });
  }

  await supabase.from("opportunities").update({ converted_action_id: action.id }).eq("id", id);
  return NextResponse.json({ actionId: action.id });
}
