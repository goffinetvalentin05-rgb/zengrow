import { OBJECTIVE_PRIORITY_CATEGORIES } from "@/src/lib/sharpz/constants";
import type { ActionCategory, ObjectiveKey, Prospect, SharpzAction } from "@/src/lib/sharpz/types";

const MAX_TODAY_ACTIONS = 5;

export function selectTodayActions(
  actions: SharpzAction[],
  primaryObjectiveKey: ObjectiveKey | string | null,
): SharpzAction[] {
  const priorityCategories = new Set<ActionCategory>(
    primaryObjectiveKey && primaryObjectiveKey in OBJECTIVE_PRIORITY_CATEGORIES
      ? OBJECTIVE_PRIORITY_CATEGORIES[primaryObjectiveKey as ObjectiveKey]
      : [],
  );

  const open = actions.filter((item) => item.status === "todo" || item.status === "in_progress");

  return open
    .map((action) => {
      let rank = action.score;
      if (priorityCategories.has(action.category as ActionCategory)) rank += 12;
      if (action.objectiveKey && action.objectiveKey === primaryObjectiveKey) rank += 8;
      if (action.status === "in_progress") rank += 4;
      return { action, rank };
    })
    .sort((a, b) => b.rank - a.rank || b.action.score - a.action.score)
    .slice(0, MAX_TODAY_ACTIONS)
    .map((item) => item.action);
}

export function countFollowUpProspects(prospects: Prospect[]): number {
  const now = Date.now();
  return prospects.filter((item) => {
    if (item.status === "to_contact" || item.status === "followed_up") return true;
    if (item.nextFollowUpAt && new Date(item.nextFollowUpAt).getTime() <= now) return true;
    return false;
  }).length;
}

export function countDoneToday(actions: SharpzAction[]): number {
  const today = new Date().toDateString();
  return actions.filter(
    (item) => item.status === "done" && new Date(item.updatedAt ?? item.detectedAt).toDateString() === today,
  ).length;
}

export function resolveFocusCategory(
  dayActions: SharpzAction[],
  doneActions: SharpzAction[],
): string | null {
  return dayActions[0]?.category ?? doneActions[0]?.category ?? null;
}
