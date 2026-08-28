import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { TodayView } from "@/src/components/sharpz/today/today-view";
import { getTrafficSummary } from "@/src/lib/sharpz/analytics";
import {
  buildFollowUpGrowthSignal,
  enrichDueFollowUps,
  selectDueFollowUps,
} from "@/src/lib/sharpz/follow-ups";
import { selectExperimentsNeedingAttention } from "@/src/lib/sharpz/experiments";
import { buildAttentionSignals } from "@/src/lib/sharpz/signals";
import {
  countDoneToday,
  countFollowUpProspects,
  resolveFocusCategory,
  selectTodayActions,
} from "@/src/lib/sharpz/today-plan";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";
import {
  getActions,
  getAuditFindings,
  getCompetitorChanges,
  getExperiments,
  getLatestAudit,
  getObjectives,
  getProspectScripts,
  getProspects,
  getUserSaas,
} from "@/src/lib/sharpz/queries";

export default async function DashboardHomePage() {
  const { restaurant } = await requireRestaurantSession();
  const supabase = await createClient();

  const [allActions, lastAudit, objectives, prospects, changes, saas, traffic, scripts, experiments] =
    await Promise.all([
      getActions(supabase, restaurant.id),
      getLatestAudit(supabase, restaurant.id),
      getObjectives(supabase, restaurant.id),
      getProspects(supabase, restaurant.id),
      getCompetitorChanges(supabase, restaurant.id),
      getUserSaas(supabase, restaurant.id),
      getTrafficSummary(supabase, restaurant.id).catch(() => null),
      getProspectScripts(supabase, restaurant.id),
      getExperiments(supabase, restaurant.id),
    ]);

  const actions = allActions.filter(
    (action) => action.sourceType !== "audit" || action.sourceId === lastAudit?.id,
  );
  const findings = lastAudit
    ? await getAuditFindings(supabase, restaurant.id, lastAudit.id)
    : [];

  const primary = objectives.find((item) => item.isPrimary);
  const dayActions = selectTodayActions(actions, primary?.key ?? null);
  const done = actions.filter((item) => item.status === "done");
  const openStatuses = new Set(["todo", "in_progress"]);
  const dueProspects = selectDueFollowUps(prospects);
  const dueFollowUps = enrichDueFollowUps(dueProspects, scripts, {
    name: saas?.name ?? null,
    url: saas?.url ?? null,
    description: saas?.description ?? null,
    pricingSummary: saas?.pricingSummary ?? null,
    objectiveKey: primary?.key ?? null,
    objectiveCustomLabel: primary?.customLabel ?? null,
  });
  const followUpGrowthSignal = buildFollowUpGrowthSignal(
    dueProspects,
    `${SHARPZ_ROUTES.dashboard}#today-follow-ups`,
  );
  const experimentSignals = selectExperimentsNeedingAttention(experiments).map((item) => {
    const planned = item.plannedEndAt ? new Date(item.plannedEndAt) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isDueToday = planned ? planned.toDateString() === today.toDateString() || planned < today : false;
    return {
      id: `experiment-${item.id}`,
      title: item.title || item.hypothesis,
      detail: isDueToday
        ? "L’expérience est arrivée à sa date de fin — terminer dans Résultats."
        : "Ton expérience se termine demain — terminer dans Résultats.",
      href: SHARPZ_ROUTES.results,
    };
  });

  return (
    <TodayView
      saasName={saas?.name ?? null}
      saasStageKey={saas?.stage ?? null}
      primaryObjectiveKey={primary?.key ?? null}
      dayActions={dayActions}
      dueFollowUps={dueFollowUps}
      signals={buildAttentionSignals({
        changes,
        findings,
        content: [],
        opportunities: [],
        followUpGrowthSignal,
        extraSignals: experimentSignals,
      })}
      doneCount={done.length}
      doneTodayCount={countDoneToday(actions)}
      openCount={actions.filter((item) => openStatuses.has(item.status)).length}
      followUpProspectCount={countFollowUpProspects(prospects)}
      visitors7d={traffic?.hasData ? traffic.visitors7d : null}
      focusCategoryKey={resolveFocusCategory(dayActions, done)}
      hasVerifiedAudit={Boolean(lastAudit)}
      auditScore={lastAudit?.globalScore ?? null}
    />
  );
}
