import type { ProspectStatus } from "@/src/lib/sharpz/types";

/** Colonnes pipeline WaveOne — ordre d’affichage Kanban. */
export const PIPELINE_STATUSES: ProspectStatus[] = [
  "to_contact",
  "follow_up_1",
  "follow_up_2",
  "in_discussion",
  "qualified",
  "customer",
  "closed",
];

export function isPipelineStatus(value: string): value is ProspectStatus {
  return PIPELINE_STATUSES.includes(value as ProspectStatus);
}

function localDayStamp(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export function isFollowUpToday(iso: string | null | undefined) {
  if (!iso) return false;
  return localDayStamp(new Date(iso)) === localDayStamp(new Date());
}

export function isFollowUpOverdue(iso: string | null | undefined) {
  if (!iso) return false;
  const due = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function isActivePipelineStatus(status: string) {
  return isPipelineStatus(status) && status !== "closed";
}

/** Statuts où une relance est attendue (utilisé par Aujourd’hui). */
export const FOLLOW_UP_STATUSES: ProspectStatus[] = [
  "to_contact",
  "follow_up_1",
  "follow_up_2",
];
