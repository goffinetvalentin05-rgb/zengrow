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

/** Statuts où une relance est attendue (utilisé par Aujourd’hui). */
export const FOLLOW_UP_STATUSES: ProspectStatus[] = [
  "to_contact",
  "follow_up_1",
  "follow_up_2",
];
