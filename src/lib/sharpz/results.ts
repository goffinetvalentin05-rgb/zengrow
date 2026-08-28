import type { SupabaseClient } from "@supabase/supabase-js";
import { getActionImpacts } from "@/src/lib/sharpz/queries";
import type { ActionImpact, SharpzAction } from "@/src/lib/sharpz/types";

const WINDOW_DAYS = 7;
const METRIC_VISITORS = "visitors";

export type ResultImpactRow = ActionImpact & {
  actionTitle: string;
};

export type ResultsProspectStats = {
  customers: number;
  qualified: number;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function asNumber(value: unknown): number | null {
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function countVisitors(
  supabase: SupabaseClient,
  restaurantId: string,
  from: Date,
  to: Date,
): Promise<number | null> {
  const { data, error } = await supabase.rpc("sharpz_analytics_distinct_visitors", {
    p_restaurant_id: restaurantId,
    p_from: from.toISOString(),
    p_to: to.toISOString(),
  });
  if (error) return null;
  return asNumber(data) ?? 0;
}

async function hasExistingTrafficImpact(
  supabase: SupabaseClient,
  restaurantId: string,
  actionId: string,
) {
  const { data } = await supabase
    .from("action_impacts")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .eq("action_id", actionId)
    .eq("metric", METRIC_VISITORS)
    .eq("attribution_type", "observed_after")
    .maybeSingle();
  return Boolean(data?.id);
}

export async function computeTrafficImpactForAction(
  supabase: SupabaseClient,
  restaurantId: string,
  action: SharpzAction,
): Promise<boolean> {
  if (action.status !== "done") return false;

  const completedAt = new Date(action.updatedAt || action.detectedAt);
  if (Number.isNaN(completedAt.getTime())) return false;

  const afterEnd = addDays(completedAt, WINDOW_DAYS);
  if (new Date() < afterEnd) return false;

  if (await hasExistingTrafficImpact(supabase, restaurantId, action.id)) return false;

  const beforeFrom = addDays(completedAt, -WINDOW_DAYS);
  const beforeTo = completedAt;
  const afterFrom = completedAt;
  const afterTo = afterEnd;

  const [beforeValue, afterValue] = await Promise.all([
    countVisitors(supabase, restaurantId, beforeFrom, beforeTo),
    countVisitors(supabase, restaurantId, afterFrom, afterTo),
  ]);

  if (beforeValue == null || afterValue == null) return false;

  const deltaAbsolute = afterValue - beforeValue;
  const deltaPercent =
    beforeValue > 0 ? Math.round(((afterValue - beforeValue) / beforeValue) * 1000) / 10 : null;

  const { error } = await supabase.from("action_impacts").insert({
    restaurant_id: restaurantId,
    action_id: action.id,
    metric: METRIC_VISITORS,
    before_value: beforeValue,
    after_value: afterValue,
    delta_absolute: deltaAbsolute,
    delta_percent: deltaPercent,
    observed_from: beforeFrom.toISOString(),
    observed_to: afterTo.toISOString(),
    attribution_type: "observed_after",
    confidence: 35,
    evidence:
      "Comparaison des visiteurs uniques sur 7 jours avant vs 7 jours après la complétion de l’action. Corrélation temporelle uniquement — d’autres facteurs peuvent expliquer la variation.",
  });

  return !error;
}

export async function syncObservedTrafficImpacts(
  supabase: SupabaseClient,
  restaurantId: string,
  actions: SharpzAction[],
  trafficHasData: boolean,
) {
  if (!trafficHasData) return;

  const candidates = actions.filter((action) => action.status === "done").slice(0, 24);
  await Promise.all(
    candidates.map((action) => computeTrafficImpactForAction(supabase, restaurantId, action)),
  );
}

export function enrichImpacts(impacts: ActionImpact[], actions: SharpzAction[]): ResultImpactRow[] {
  const titles = new Map(actions.map((action) => [action.id, action.title]));
  return impacts.map((impact) => ({
    ...impact,
    actionTitle: titles.get(impact.actionId) ?? "—",
  }));
}

export async function loadResultsImpacts(
  supabase: SupabaseClient,
  restaurantId: string,
  actions: SharpzAction[],
  trafficHasData: boolean,
): Promise<ResultImpactRow[]> {
  await syncObservedTrafficImpacts(supabase, restaurantId, actions, trafficHasData);
  const impacts = await getActionImpacts(supabase, restaurantId);
  return enrichImpacts(impacts, actions);
}

export function computeProspectStats(
  prospects: { status: string; updatedAt: string }[],
  period: "week" | "month",
): ResultsProspectStats {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (period === "week" ? 7 : 30));

  const inPeriod = prospects.filter((item) => new Date(item.updatedAt) >= start);
  return {
    customers: inPeriod.filter((item) => item.status === "customer").length,
    qualified: inPeriod.filter((item) => item.status === "qualified").length,
  };
}
