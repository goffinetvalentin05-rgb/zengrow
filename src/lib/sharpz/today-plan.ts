import { OBJECTIVE_PRIORITY_CATEGORIES } from "@/src/lib/sharpz/constants";
import { selectDueFollowUps } from "@/src/lib/sharpz/follow-ups";
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

/** Compte les relances dues (next_follow_up_at ≤ aujourd’hui, hors client/fermé). */
export function countFollowUpProspects(prospects: Prospect[]): number {
  return selectDueFollowUps(prospects).length;
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
