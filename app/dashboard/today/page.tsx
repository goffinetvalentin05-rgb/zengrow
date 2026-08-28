import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { TodayView } from "@/src/components/sharpz/today/today-view";
import { buildAttentionSignals } from "@/src/lib/sharpz/signals";
import {
  countDoneToday,
  countFollowUpProspects,
  resolveFocusCategory,
  selectTodayActions,
} from "@/src/lib/sharpz/today-plan";
import { FOLLOW_UP_STATUSES } from "@/src/lib/sharpz/prospects-pipeline";
import {
  getActions,
  getAuditFindings,
  getCompetitorChanges,
  getLatestAudit,
  getObjectives,
  getProspects,
} from "@/src/lib/sharpz/queries";

export default async function TodayPage() {
  const { restaurant } = await requireRestaurantSession();
  const supabase = await createClient();

  const [allActions, lastAudit, objectives, prospects, changes] = await Promise.all([
    getActions(supabase, restaurant.id),
    getLatestAudit(supabase, restaurant.id),
    getObjectives(supabase, restaurant.id),
    getProspects(supabase, restaurant.id),
    getCompetitorChanges(supabase, restaurant.id),
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
  const followUpProspects = prospects.filter((item) => {
    if (FOLLOW_UP_STATUSES.includes(item.status as (typeof FOLLOW_UP_STATUSES)[number])) return true;
    if (item.nextFollowUpAt && new Date(item.nextFollowUpAt) <= new Date()) return true;
    return false;
  });

  return (
    <TodayView
      primaryObjectiveKey={primary?.key ?? null}
      dayActions={dayActions}
      signals={buildAttentionSignals({
        changes,
        findings,
        content: [],
        opportunities: [],
        followUpProspects: followUpProspects.map((item) => ({
          id: item.id,
          title: item.name?.trim() || item.company,
          detail: item.nextFollowUpAt
            ? `Relance — ${new Date(item.nextFollowUpAt).toLocaleDateString()}`
            : item.status,
        })),
      })}
      doneCount={done.length}
      doneTodayCount={countDoneToday(actions)}
      openCount={actions.filter((item) => openStatuses.has(item.status)).length}
      followUpProspectCount={countFollowUpProspects(prospects)}
      focusCategoryKey={resolveFocusCategory(dayActions, done)}
      hasVerifiedAudit={Boolean(lastAudit)}
      auditScore={lastAudit?.globalScore ?? null}
    />
  );
}
