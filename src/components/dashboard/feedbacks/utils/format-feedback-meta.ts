import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { normalizeReservationDateYmd } from "@/src/lib/date/business-calendar";

export function formatFeedbackRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return formatDistanceToNow(date, { addSuffix: true, locale: fr });
}

export function formatVisitDateLabel(reservationDate: string | null): string | null {
  if (!reservationDate) return null;
  const ymd = normalizeReservationDateYmd(reservationDate);
  try {
    const ref = new Date(`${ymd}T12:00:00`);
    if (Number.isNaN(ref.getTime())) return null;
    return format(ref, "d MMMM", { locale: fr });
  } catch {
    return null;
  }
}

export function buildFeedbackMetaLine(createdAt: string, reservationDate: string | null): string {
  const relative = formatFeedbackRelativeDate(createdAt);
  const visit = formatVisitDateLabel(reservationDate);
  if (relative && visit) return `${relative} · Visite du ${visit}`;
  if (relative) return relative;
  if (visit) return `Visite du ${visit}`;
  return "";
}

export function displayCustomerName(name: string | null): string {
  const trimmed = name?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "Client";
}
