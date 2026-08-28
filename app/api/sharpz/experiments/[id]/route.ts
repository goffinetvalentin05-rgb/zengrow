import { NextResponse } from "next/server";
import { z } from "zod";
import { parseJson, requireSharpzApi } from "@/src/lib/sharpz/api-session";
import {
  buildExperimentConclusion,
  buildExperimentResultSummary,
  computeMetricDeltas,
  isExperimentMetric,
  readExperimentMetric,
} from "@/src/lib/sharpz/experiments";

const bodySchema = z.object({
  action: z.enum(["start", "complete", "cancel"]),
  notes: z.string().max(4000).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await requireSharpzApi();
  if (!session.ok) return session.error;
  const { supabase, restaurant } = session;
  const { id } = await context.params;
  const raw = await parseJson<unknown>(request);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("experiments")
    .select("*")
    .eq("id", id)
    .eq("restaurant_id", restaurant.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Expérience introuvable." }, { status: 404 });
  }

  const action = parsed.data.action;

  if (action === "cancel") {
    if (existing.status === "completed" || existing.status === "cancelled") {
      return NextResponse.json({ error: "Expérience déjà clôturée." }, { status: 400 });
    }
    const { error } = await supabase
      .from("experiments")
      .update({
        status: "cancelled",
        completed_at: new Date().toISOString(),
        notes: parsed.data.notes?.trim() || existing.notes,
      })
      .eq("id", id)
      .eq("restaurant_id", restaurant.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, status: "cancelled" });
  }

  if (action === "start") {
    if (existing.status !== "draft") {
      return NextResponse.json({ error: "Seules les expériences brouillon peuvent démarrer." }, { status: 400 });
    }
    const now = new Date();
    let beforeValue: number | null = null;
    let metricSource: string | null = existing.metric_source ?? null;
    const metric = typeof existing.metric === "string" ? existing.metric : null;

    if (metric && isExperimentMetric(metric)) {
      const snapshot = await readExperimentMetric(supabase, restaurant.id, metric);
      beforeValue = snapshot.available ? snapshot.value : null;
      metricSource = snapshot.source;
    }

    const { error } = await supabase
      .from("experiments")
      .update({
        status: "running",
        started_at: now.toISOString(),
        before_value: beforeValue,
        metric_source: metricSource,
        notes: parsed.data.notes?.trim() || existing.notes,
      })
      .eq("id", id)
      .eq("restaurant_id", restaurant.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({
      ok: true,
      status: "running",
      beforeValue,
      beforeAvailable: beforeValue != null,
    });
  }

  // complete
  if (existing.status !== "running") {
    return NextResponse.json({ error: "Seules les expériences actives peuvent être terminées." }, { status: 400 });
  }

  const metric = typeof existing.metric === "string" ? existing.metric : null;
  let afterValue: number | null = null;
  let metricAvailable = false;

  if (metric && isExperimentMetric(metric)) {
    const snapshot = await readExperimentMetric(supabase, restaurant.id, metric);
    metricAvailable = snapshot.available;
    afterValue = snapshot.available ? snapshot.value : null;
  }

  const beforeValue = existing.before_value != null ? Number(existing.before_value) : null;
  const { deltaAbsolute, deltaPercent } = computeMetricDeltas(beforeValue, afterValue);
  const conclusion = buildExperimentConclusion({
    before: beforeValue,
    after: afterValue,
    deltaPercent,
    metricAvailable: metricAvailable || beforeValue != null || afterValue != null,
  });
  const result = buildExperimentResultSummary({
    before: beforeValue,
    after: afterValue,
    deltaAbsolute,
    deltaPercent,
  });
  const completedAt = new Date().toISOString();

  const { error } = await supabase
    .from("experiments")
    .update({
      status: "completed",
      completed_at: completedAt,
      after_value: afterValue,
      delta_absolute: deltaAbsolute,
      delta_percent: deltaPercent,
      result,
      conclusion,
      notes: parsed.data.notes?.trim() || existing.notes,
    })
    .eq("id", id)
    .eq("restaurant_id", restaurant.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // action_impacts exige action_id — uniquement si l’expérience est liée à une action.
  if (existing.action_id && metric) {
    await supabase.from("action_impacts").insert({
      restaurant_id: restaurant.id,
      action_id: existing.action_id,
      experiment_id: id,
      metric,
      before_value: beforeValue,
      after_value: afterValue,
      delta_absolute: deltaAbsolute,
      delta_percent: deltaPercent,
      observed_from: existing.started_at,
      observed_to: completedAt,
      attribution_type: "experiment",
      confidence: beforeValue != null && afterValue != null ? 55 : 25,
      evidence: conclusion,
    });
  }

  return NextResponse.json({
    ok: true,
    status: "completed",
    beforeValue,
    afterValue,
    deltaAbsolute,
    deltaPercent,
    result,
    conclusion,
  });
}
