import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import {
  clampConfidence,
  clampEffort,
  clampImpact,
  computeSharpzScore,
} from "@/src/lib/sharpz/scoring";
import type { ActionCategory } from "@/src/lib/sharpz/types";

const ACTION_CATEGORIES = new Set<ActionCategory>([
  "acquisition",
  "conversion",
  "landing",
  "pricing",
  "content",
  "seo",
  "retention",
  "market",
  "prospection",
  "monetisation",
  "positioning",
]);

const actionInputSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(40),
  impact: z.number().min(1).max(10),
  effort: z.number().min(1).max(10),
  confidence: z.number().min(0).max(100),
  why: z.string().max(2000).optional(),
  howTo: z.string().max(4000).optional(),
  objectiveKey: z.string().max(40).nullable().optional(),
});

const bodySchema = z.object({
  actions: z.array(actionInputSchema).min(1).max(5),
});

function normalizeCategory(value: string): ActionCategory {
  return ACTION_CATEGORIES.has(value as ActionCategory) ? (value as ActionCategory) : "acquisition";
}

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const body = await parseJson<unknown>(request);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Actions invalides." }, { status: 400 });
  }

  const inserted: string[] = [];
  for (const item of parsed.data.actions) {
    const impact = clampImpact(item.impact);
    const effort = clampEffort(item.effort);
    const confidence = clampConfidence(item.confidence);
    const { data, error } = await supabase
      .from("actions")
      .insert({
        restaurant_id: restaurant.id,
        title: item.title.trim(),
        category: normalizeCategory(item.category),
        status: "todo",
        impact,
        effort,
        confidence,
        score: computeSharpzScore(impact, effort, confidence),
        why: item.why?.trim() || null,
        how_to: item.howTo?.trim() || null,
        micro_steps: [],
        objective_key: item.objectiveKey ?? null,
        source_type: "agent",
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Impossible de créer l’action.", inserted },
        { status: 400 },
      );
    }
    inserted.push(String(data.id));
  }

  return NextResponse.json({ ids: inserted });
}
