import { requireRestaurantSession } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { TodayView } from "@/src/components/sharpz/today/today-view";
import { buildAttentionSignals } from "@/src/lib/sharpz/signals";
import {
  getActions,
  getAuditFindings,
  getCompetitorChanges,
  getContentOpportunities,
  getLatestAudit,
  getObjectives,
  getOpportunities,
  getUserSaas,
} from "@/src/lib/sharpz/queries";

function firstNameFromUser(meta: Record<string, unknown> | undefined, email: string | undefined) {
  const name = typeof meta?.full_name === "string" ? meta.full_name.trim() : "";
  if (name) return name.split(/\s+/)[0] ?? name;
  const local = email?.split("@")[0]?.trim();
  return local || null;
}

export default async function DashboardPage() {
  const { restaurant, user } = await requireRestaurantSession();
  const supabase = await createClient();

  const [actions, opportunities, changes, lastAudit, saas, objectives, content] = await Promise.all([
    getActions(supabase, restaurant.id),
    getOpportunities(supabase, restaurant.id),
    getCompetitorChanges(supabase, restaurant.id),
    getLatestAudit(supabase, restaurant.id),
    getUserSaas(supabase, restaurant.id),
    getObjectives(supabase, restaurant.id),
    getContentOpportunities(supabase, restaurant.id),
  ]);
  const findings = await getAuditFindings(supabase, restaurant.id, lastAudit?.id);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const done = actions.filter((item) => item.status === "done");
  const doneThisWeek = done.filter((item) => new Date(item.updatedAt ?? item.detectedAt).getTime() >= weekAgo);
  const openStatuses = new Set(["todo", "in_progress"]);
  const focusKey = doneThisWeek[0]?.category ?? done[0]?.category ?? null;
  const primary = objectives.find((item) => item.isPrimary);

  const meta = user.user_metadata as Record<string, unknown> | undefined;

  return (
    <TodayView
      firstName={firstNameFromUser(meta, user.email ?? undefined)}
      saasName={saas?.name ?? null}
      primaryObjectiveKey={primary?.key ?? null}
      actions={actions}
      signals={buildAttentionSignals({
        changes: changes.filter((item) => item.importance === "high" || item.importance === "medium"),
        findings,
        content,
        opportunities,
      })}
      doneCount={done.length}
      openCount={actions.filter((item) => openStatuses.has(item.status)).length}
      doneThisWeek={doneThisWeek.length}
      focusCategoryKey={focusKey}
    />
  );
}
