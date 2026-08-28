import { NextResponse } from "next/server";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import { getActions } from "@/src/lib/sharpz/queries";
import { computeSharpzScore } from "@/src/lib/sharpz/scoring";
import { OBJECTIVE_PRIORITY_CATEGORIES } from "@/src/lib/sharpz/constants";
import type { ObjectiveKey } from "@/src/lib/sharpz/types";

export async function PUT(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const body = await parseJson<{
    primaryObjective?: string;
    extraObjectives?: string[];
    channels?: string[];
  }>(request);

  const primary = body?.primaryObjective?.trim();
  if (!primary) return NextResponse.json({ error: "Objectif principal requis." }, { status: 400 });
  const extra = (body?.extraObjectives ?? []).filter((item) => item && item !== primary);
  const channels = body?.channels ?? [];

  await supabase.from("user_objectives").delete().eq("restaurant_id", restaurant.id);
  await supabase.from("user_objectives").insert([
    { restaurant_id: restaurant.id, key: primary, is_primary: true },
    ...extra.map((key) => ({ restaurant_id: restaurant.id, key, is_primary: false })),
  ]);

  await supabase.from("acquisition_channels").delete().eq("restaurant_id", restaurant.id);
  if (channels.length) {
    await supabase.from("acquisition_channels").insert(
      channels.map((channel) => ({ restaurant_id: restaurant.id, channel })),
    );
  }

  const priority = OBJECTIVE_PRIORITY_CATEGORIES[primary as ObjectiveKey] ?? [];
  if (priority.length) {
    const actions = await getActions(supabase, restaurant.id);
    for (const action of actions.filter((item) => item.status === "todo" || item.status === "in_progress")) {
      const boost = priority.includes(action.category as (typeof priority)[number]) ? 1 : 0;
      const score = computeSharpzScore(action.impact + boost, action.effort, action.confidence);
      await supabase.from("actions").update({ score, objective_key: primary }).eq("id", action.id);
    }
  }

  return NextResponse.json({ ok: true });
}
