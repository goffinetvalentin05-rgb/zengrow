import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { TodayView } from "@/src/components/sharpz/today/today-view";
import { buildAttentionSignals } from "@/src/lib/sharpz/signals";
import {
  getActions,
  getAuditFindings,
  getLatestAudit,
  getObjectives,
} from "@/src/lib/sharpz/queries";

export default async function TodayPage() {
  const { restaurant } = await requireRestaurantSession();
  const supabase = await createClient();

  const [allActions, lastAudit, objectives] = await Promise.all([
    getActions(supabase, restaurant.id),
    getLatestAudit(supabase, restaurant.id),
    getObjectives(supabase, restaurant.id),
  ]);

  const actions = allActions.filter(
    (action) => action.sourceType !== "audit" || action.sourceId === lastAudit?.id,
  );
  const findings = lastAudit
    ? await getAuditFindings(supabase, restaurant.id, lastAudit.id)
    : [];

  const done = actions.filter((item) => item.status === "done");
  const openStatuses = new Set(["todo", "in_progress"]);
  const focusKey = done[0]?.category ?? null;
  const primary = objectives.find((item) => item.isPrimary);

  return (
    <TodayView
      primaryObjectiveKey={primary?.key ?? null}
      actions={actions}
      signals={buildAttentionSignals({
        changes: [],
        findings,
        content: [],
        opportunities: [],
      })}
      doneCount={done.length}
      openCount={actions.filter((item) => openStatuses.has(item.status)).length}
      focusCategoryKey={focusKey}
    />
  );
}
