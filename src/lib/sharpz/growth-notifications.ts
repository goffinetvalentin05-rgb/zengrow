import type { SupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "@/src/lib/notifications/create";
import type { CreateNotificationResult, NotificationSeverity } from "@/src/lib/notifications/types";
import { getTrafficSummary } from "@/src/lib/sharpz/analytics";
import { selectDueFollowUps } from "@/src/lib/sharpz/follow-ups";
import { SHARPZ_ROUTES, analyticsHref } from "@/src/lib/sharpz/routes";
import { getCompetitorChanges, getExperiments, getProspects } from "@/src/lib/sharpz/queries";
import { getStripeRevenueSummary } from "@/src/lib/sharpz/stripe-revenue";

export type GrowthNotificationDraft = {
  type:
    | "growth_follow_up_due"
    | "growth_experiment_due"
    | "growth_experiment_overdue"
    | "growth_traffic_signal"
    | "growth_revenue_signal"
    | "growth_competitor_change";
  title: string;
  message: string;
  dedupKey: string;
  severity: NotificationSeverity;
  actionUrl: string;
  relatedEntityType: string;
  relatedEntityId?: string | null;
};

function localDayKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function startOfLocalDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function countVisitorsWindow(
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
  const n = Number(data);
  return Number.isFinite(n) ? n : null;
}

/** Canaux supportés plus tard ; V1 = in_app uniquement (table notifications). */
export type GrowthNotificationChannel = "in_app" | "email" | "push";

export const GROWTH_NOTIFICATION_CHANNELS_V1: GrowthNotificationChannel[] = ["in_app"];

/**
 * Détecte les GrowthSignals réels pour un tenant.
 * Aucune invention — si donnée absente, le signal n’est pas émis.
 */
export async function detectGrowthNotificationDrafts(
  supabase: SupabaseClient,
  restaurantId: string,
  now = new Date(),
): Promise<GrowthNotificationDraft[]> {
  const drafts: GrowthNotificationDraft[] = [];
  const dayKey = localDayKey(now);
  const todayStart = startOfLocalDay(now);

  const [prospects, experiments, changes] = await Promise.all([
    getProspects(supabase, restaurantId),
    getExperiments(supabase, restaurantId),
    getCompetitorChanges(supabase, restaurantId),
  ]);

  // 1. Relances groupées (1 notif pour N ; pas de rappel quotidien si le set due n’évolue pas)
  const due = selectDueFollowUps(prospects, now);
  if (due.length > 0) {
    const count = due.length;
    const dueFingerprint = due
      .map((p) => p.id)
      .sort()
      .join(",");
    drafts.push({
      type: "growth_follow_up_due",
      title: count === 1 ? "1 prospect à relancer" : `${count} prospects à relancer`,
      message:
        count === 1
          ? `${due[0]?.name?.trim() || due[0]?.company} — relance due aujourd’hui.`
          : `${count} prospects ont une relance due aujourd’hui (next_follow_up_at).`,
      dedupKey: `growth_follow_up_due:${restaurantId}:${dueFingerprint}`,
      severity: "attention",
      actionUrl: SHARPZ_ROUTES.prospects,
      relatedEntityType: "growth",
      relatedEntityId: null,
    });
  }

  // 2–3. Expériences due / overdue
  for (const experiment of experiments) {
    if (experiment.status !== "running" || !experiment.plannedEndAt) continue;
    const planned = startOfLocalDay(new Date(experiment.plannedEndAt));
    if (Number.isNaN(planned.getTime())) continue;
    const label = experiment.title?.trim() || experiment.hypothesis.slice(0, 80);
    const plannedKey = localDayKey(planned);

    if (planned.getTime() === todayStart.getTime()) {
      drafts.push({
        type: "growth_experiment_due",
        title: "Expérience se termine aujourd’hui",
        message: `« ${label} » arrive à échéance — terminer dans Résultats.`,
        dedupKey: `growth_experiment_due:${experiment.id}:${plannedKey}`,
        severity: "info",
        actionUrl: SHARPZ_ROUTES.results,
        relatedEntityType: "experiment",
        relatedEntityId: experiment.id,
      });
      continue;
    }

    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (planned.getTime() === tomorrow.getTime()) {
      drafts.push({
        type: "growth_experiment_due",
        title: "Expérience se termine demain",
        message: `« ${label} » se termine demain.`,
        dedupKey: `growth_experiment_due:${experiment.id}:${plannedKey}`,
        severity: "info",
        actionUrl: SHARPZ_ROUTES.results,
        relatedEntityType: "experiment",
        relatedEntityId: experiment.id,
      });
      continue;
    }

    if (planned.getTime() < todayStart.getTime()) {
      const overdueFloor = new Date(todayStart);
      overdueFloor.setDate(overdueFloor.getDate() - 14);
      if (planned >= overdueFloor) {
        drafts.push({
          type: "growth_experiment_overdue",
          title: "Expérience arrivée à échéance",
          message: `« ${label} » est en retard — clôturer dans Résultats.`,
          dedupKey: `growth_experiment_overdue:${experiment.id}:${plannedKey}`,
          severity: "attention",
          actionUrl: SHARPZ_ROUTES.results,
          relatedEntityType: "experiment",
          relatedEntityId: experiment.id,
        });
      }
    }
  }

  // 4. Trafic — uniquement si Analytics a des données
  const traffic = await getTrafficSummary(supabase, restaurantId).catch(() => null);
  if (traffic?.hasData) {
    const currentFrom = new Date(now);
    currentFrom.setDate(currentFrom.getDate() - 7);
    const prevFrom = new Date(now);
    prevFrom.setDate(prevFrom.getDate() - 14);
    const [current, previous] = await Promise.all([
      countVisitorsWindow(supabase, restaurantId, currentFrom, now),
      countVisitorsWindow(supabase, restaurantId, prevFrom, currentFrom),
    ]);
    if (current != null && previous != null && previous >= 20) {
      const dropPct = ((previous - current) / previous) * 100;
      if (dropPct >= 20) {
        const rounded = Math.round(dropPct);
        drafts.push({
          type: "growth_traffic_signal",
          title: "Baisse de trafic observée",
          message: `Ton trafic a baissé de ${rounded} % par rapport à la période précédente (${previous} → ${current} visiteurs).`,
          dedupKey: `growth_traffic_signal:${dayKey}:${restaurantId}`,
          severity: rounded >= 40 ? "critical" : "attention",
          actionUrl: analyticsHref("traffic"),
          relatedEntityType: "growth",
        });
      }
    }
  }

  // 5. Revenue — uniquement Stripe connecté + mesure précédente réelle
  const { data: stripeRow } = await supabase
    .from("integrations")
    .select("status, config")
    .eq("restaurant_id", restaurantId)
    .eq("provider", "stripe")
    .maybeSingle();

  if (stripeRow?.status === "connected") {
    const config = (stripeRow.config ?? {}) as Record<string, unknown>;
    const baselineMrr = typeof config.mrrCents === "number" ? config.mrrCents : null;
    const live = await getStripeRevenueSummary(supabase, restaurantId).catch(() => null);
    if (live?.connected && baselineMrr != null && baselineMrr > 0) {
      const dropPct = ((baselineMrr - live.mrrCents) / baselineMrr) * 100;
      if (dropPct >= 10) {
        const rounded = Math.round(dropPct);
        drafts.push({
          type: "growth_revenue_signal",
          title: "MRR en baisse",
          message: `Ton MRR a baissé d’environ ${rounded} % par rapport à la dernière mesure enregistrée.`,
          dedupKey: `growth_revenue_signal:${dayKey}:${restaurantId}`,
          severity: rounded >= 25 ? "critical" : "attention",
          actionUrl: analyticsHref("revenue"),
          relatedEntityType: "growth",
        });
      }
    }
  }

  // 6. Concurrents — uniquement changements déjà en DB (jamais inventés)
  const recentCutoff = new Date(now);
  recentCutoff.setDate(recentCutoff.getDate() - 3);
  for (const change of changes.slice(0, 10)) {
    const created = new Date(change.createdAt);
    if (Number.isNaN(created.getTime()) || created < recentCutoff) continue;
    if (!change.whatChanged?.trim()) continue;
    drafts.push({
      type: "growth_competitor_change",
      title: "Changement concurrent détecté",
      message: change.whatChanged.slice(0, 200),
      dedupKey: `growth_competitor_change:${change.id}`,
      severity: "info",
      actionUrl: analyticsHref("market"),
      relatedEntityType: "competitor_change",
      relatedEntityId: change.id,
    });
  }

  return drafts;
}

export async function persistGrowthNotificationDrafts(
  restaurantId: string,
  drafts: GrowthNotificationDraft[],
): Promise<{ created: number; skipped: number; errors: number }> {
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const draft of drafts) {
    const result: CreateNotificationResult = await createNotification({
      restaurantId,
      type: draft.type,
      title: draft.title,
      message: draft.message,
      actionUrl: draft.actionUrl,
      relatedEntityType: draft.relatedEntityType,
      relatedEntityId: draft.relatedEntityId ?? null,
      dedupKey: draft.dedupKey,
      severity: draft.severity,
    });
    if (!result.ok) {
      errors += 1;
      continue;
    }
    if (result.skipped) skipped += 1;
    else created += 1;
  }

  return { created, skipped, errors };
}

/** Sync notifications Growth pour un restaurant (idempotent). */
export async function syncGrowthNotificationsForRestaurant(
  supabase: SupabaseClient,
  restaurantId: string,
  now = new Date(),
) {
  const drafts = await detectGrowthNotificationDrafts(supabase, restaurantId, now);
  const result = await persistGrowthNotificationDrafts(restaurantId, drafts);
  return { drafts: drafts.length, ...result };
}
