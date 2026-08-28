import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import {
  isExperimentMetric,
  plannedEndFromDays,
  readExperimentMetric,
} from "@/src/lib/sharpz/experiments";

const bodySchema = z.object({
  title: z.string().max(200).optional(),
  hypothesis: z.string().min(5).max(2000),
  actionId: z.string().uuid().nullable().optional(),
  actionDescription: z.string().max(2000).nullable().optional(),
  metric: z.string().max(60).nullable().optional(),
  plannedDays: z.number().int().min(1).max(90).optional(),
  plannedEndAt: z.string().optional(),
  notes: z.string().max(4000).nullable().optional(),
  /** Si false → draft sans démarrer. Défaut : démarrer (running). */
  startNow: z.boolean().optional().default(true),
});

export async function POST(request: Request) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const raw = await parseJson<unknown>(request);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Expérience invalide." }, { status: 400 });
  }

  const body = parsed.data;
  const hypothesis = body.hypothesis.trim();
  const title = body.title?.trim() || hypothesis.slice(0, 80);
  const metric =
    body.metric && isExperimentMetric(body.metric) ? body.metric : body.metric?.trim() || null;

  if (body.metric && !isExperimentMetric(body.metric)) {
    return NextResponse.json(
      { error: "Métrique non supportée en V1. Choisissez une métrique mesurable." },
      { status: 400 },
    );
  }

  if (body.actionId) {
    const { data: action } = await supabase
      .from("actions")
      .select("id")
      .eq("id", body.actionId)
      .eq("restaurant_id", restaurant.id)
      .maybeSingle();
    if (!action) {
      return NextResponse.json({ error: "Action liée introuvable." }, { status: 400 });
    }
  }

  const startNow = body.startNow !== false;
  const now = new Date();
  let beforeValue: number | null = null;
  let metricSource: string | null = null;

  if (startNow && metric && isExperimentMetric(metric)) {
    const snapshot = await readExperimentMetric(supabase, restaurant.id, metric);
    beforeValue = snapshot.available ? snapshot.value : null;
    metricSource = snapshot.source;
  }

  const plannedEndAt = body.plannedEndAt
    ? new Date(body.plannedEndAt).toISOString()
    : plannedEndFromDays(body.plannedDays ?? 14, now);

  const { data, error } = await supabase
    .from("experiments")
    .insert({
      restaurant_id: restaurant.id,
      title,
      hypothesis,
      action_id: body.actionId ?? null,
      action_description: body.actionDescription?.trim() || null,
      metric,
      metric_source: metricSource,
      before_value: beforeValue,
      planned_end_at: plannedEndAt,
      notes: body.notes?.trim() || null,
      status: startNow ? "running" : "draft",
      started_at: startNow ? now.toISOString() : now.toISOString(),
    })
    .select("id, status, before_value, metric_source")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Impossible de créer l’expérimentation." }, { status: 400 });
  }

  return NextResponse.json({
    id: data.id,
    status: data.status,
    beforeValue: data.before_value != null ? Number(data.before_value) : null,
    metricSource: data.metric_source,
    beforeAvailable: data.before_value != null,
  });
}
