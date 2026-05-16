import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

/** Ex. « il y a 5 minutes » */
export function formatNotificationRelativeTime(createdAtIso: string, now: Date = new Date()): string {
  const date = new Date(createdAtIso);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true, locale: fr, includeSeconds: false });
}
