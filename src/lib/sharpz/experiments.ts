import type { SupabaseClient } from "@supabase/supabase-js";
import { getTrafficSummary } from "@/src/lib/sharpz/analytics";
import { getProspects } from "@/src/lib/sharpz/queries";
import { getStripeRevenueSummary } from "@/src/lib/sharpz/stripe-revenue";

export const EXPERIMENT_STATUSES = ["draft", "running", "completed", "cancelled"] as const;
export type ExperimentStatus = (typeof EXPERIMENT_STATUSES)[number];

export const EXPERIMENT_METRICS = [
  "visitors_7d",
  "pageviews_7d",
  "sessions_7d",
  "prospects_customers",
  "prospects_qualified",
  "mrr",
] as const;
export type ExperimentMetric = (typeof EXPERIMENT_METRICS)[number];

export type MetricSource = "sharpz_analytics" | "stripe" | "prospects_crm";

export type MetricSnapshot = {
  metric: ExperimentMetric;
  value: number | null;
  source: MetricSource | null;
  available: boolean;
  reason?: string;
};

export function isExperimentMetric(value: string): value is ExperimentMetric {
  return (EXPERIMENT_METRICS as readonly string[]).includes(value);
}

export function isExperimentStatus(value: string): value is ExperimentStatus {
  return (EXPERIMENT_STATUSES as readonly string[]).includes(value);
}

/** Variation % sûre — null si avant = 0 ou valeurs absentes. */
export function computeMetricDeltas(before: number | null, after: number | null) {
  if (before == null || after == null) {
    return { deltaAbsolute: null as number | null, deltaPercent: null as number | null };
  }
  const deltaAbsolute = Math.round((after - before) * 1000) / 1000;
  const deltaPercent =
    before === 0 ? null : Math.round(((after - before) / before) * 1000) / 10;
  return { deltaAbsolute, deltaPercent };
}

/**
 * Conclusion prudente — variation observée, jamais « X a causé Y ».
 */
export function buildExperimentConclusion(input: {
  before: number | null;
  after: number | null;
  deltaPercent: number | null;
  metricAvailable: boolean;
}): string {
  if (!input.metricAvailable || (input.before == null && input.after == null)) {
    return "Données insuffisantes pour mesurer cette expérience.";
  }
  if (input.before == null || input.after == null) {
    return "Données insuffisantes pour comparer avant et après.";
  }
  if (input.deltaPercent == null) {
    if (input.before === 0 && input.after === 0) {
      return "Résultat neutre — aucune variation mesurable (valeurs à zéro).";
    }
    if (input.before === 0 && input.after > 0) {
      return `Une hausse absolue a été observée pendant la période (de 0 à ${input.after}). Le pourcentage n’est pas calculable.`;
    }
    return "Variation absolue observée — pourcentage non calculable (base à zéro).";
  }
  if (Math.abs(input.deltaPercent) < 1) {
    return "Résultat neutre — variation observée inférieure à 1 % pendant la période de test.";
  }
  if (input.deltaPercent > 0) {
    return `Une hausse de ${input.deltaPercent} % a été observée pendant la période suivant le changement. Ce n’est pas une preuve causale.`;
  }
  return `Une baisse de ${Math.abs(input.deltaPercent)} % a été observée pendant la période suivant le changement. Ce n’est pas une preuve causale.`;
}

export function buildExperimentResultSummary(input: {
  before: number | null;
  after: number | null;
  deltaAbsolute: number | null;
  deltaPercent: number | null;
}): string | null {
  if (input.before == null && input.after == null) return null;
  const parts: string[] = [];
  if (input.before != null) parts.push(`Avant : ${formatMetricNumber(input.before)}`);
  if (input.after != null) parts.push(`Après : ${formatMetricNumber(input.after)}`);
  if (input.deltaPercent != null) {
    const sign = input.deltaPercent > 0 ? "+" : "";
    parts.push(`Variation observée : ${sign}${input.deltaPercent} %`);
  } else if (input.deltaAbsolute != null) {
    const sign = input.deltaAbsolute > 0 ? "+" : "";
    parts.push(`Δ absolu : ${sign}${formatMetricNumber(input.deltaAbsolute)}`);
  }
  return parts.join(" · ") || null;
}

export function formatMetricNumber(value: number) {
  if (Number.isInteger(value)) return String(value);
  return String(Math.round(value * 100) / 100);
}

export async function readExperimentMetric(
  supabase: SupabaseClient,
  restaurantId: string,
  metric: ExperimentMetric,
): Promise<MetricSnapshot> {
  if (metric === "visitors_7d" || metric === "pageviews_7d" || metric === "sessions_7d") {
    const traffic = await getTrafficSummary(supabase, restaurantId).catch(() => null);
    if (!traffic?.hasData) {
      return {
        metric,
        value: null,
        source: null,
        available: false,
        reason: "Sharpz Analytics sans données de trafic.",
      };
    }
    const value =
      metric === "visitors_7d"
        ? traffic.visitors7d
        : metric === "pageviews_7d"
          ? traffic.pageviews7d
          : traffic.sessions7d;
    return { metric, value, source: "sharpz_analytics", available: true };
  }

  if (metric === "prospects_customers" || metric === "prospects_qualified") {
    const prospects = await getProspects(supabase, restaurantId);
    const value =
      metric === "prospects_customers"
        ? prospects.filter((item) => item.status === "customer").length
        : prospects.filter((item) => item.status === "qualified").length;
    return { metric, value, source: "prospects_crm", available: true };
  }

  if (metric === "mrr") {
    const revenue = await getStripeRevenueSummary(supabase, restaurantId).catch(() => null);
    if (!revenue?.connected) {
      return {
        metric,
        value: null,
        source: null,
        available: false,
        reason: "Stripe non connecté — MRR indisponible.",
      };
    }
    return {
      metric,
      value: Math.round((revenue.mrrCents / 100) * 100) / 100,
      source: "stripe",
      available: true,
    };
  }

  return { metric, value: null, source: null, available: false, reason: "Métrique non supportée." };
}

export function plannedEndFromDays(days: number, from = new Date()) {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

/** Expériences running dont la fin prévue est aujourd’hui ou demain (signal Dashboard). */
export function selectExperimentsNeedingAttention<
  T extends { id: string; status: string; plannedEndAt?: string | null; title?: string | null; hypothesis: string },
>(experiments: T[], now = new Date()) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);

  return experiments.filter((item) => {
    if (item.status !== "running") return false;
    if (!item.plannedEndAt) return false;
    const planned = new Date(item.plannedEndAt);
    if (Number.isNaN(planned.getTime())) return false;
    const overdueFloor = new Date(start);
    overdueFloor.setDate(overdueFloor.getDate() - 7);
    // Aujourd’hui, demain, ou en retard ≤ 7 j — pas une carte pendant 14 jours.
    return planned >= overdueFloor && planned < end;
  });
}
