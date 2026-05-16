import { formatInTimeZone, toDate } from "date-fns-tz";
import { fr } from "date-fns/locale";
import { businessCalendarTimeZone } from "@/src/lib/date/business-calendar";

function normalizeTimeHm(value: string): string {
  return value.trim().slice(0, 5);
}

/** Ex. « samedi 25/05 à 19:30 » (fuseau métier). */
export function formatReservationSlotLabel(reservationDate: string, reservationTime: string): string {
  const tz = businessCalendarTimeZone();
  const ymd = reservationDate.trim().slice(0, 10);
  const hm = normalizeTimeHm(reservationTime);
  const ref = toDate(`${ymd}T12:00:00`, { timeZone: tz });
  const dayPart = formatInTimeZone(ref, tz, "EEEE d/MM", { locale: fr });
  return `${dayPart} à ${hm}`;
}

export function formatReservationNotificationMessage(input: {
  guestName: string;
  guests: number;
  reservationDate: string;
  reservationTime: string;
  statusSuffix?: string | null;
}): string {
  const name = input.guestName.trim() || "Client";
  const slot = formatReservationSlotLabel(input.reservationDate, input.reservationTime);
  const base = `${name} — ${input.guests} pers. — ${slot}`;
  const suffix = input.statusSuffix?.trim();
  return suffix ? `${base} (${suffix})` : base;
}

export function reservationDashboardActionUrl(reservationId: string): string {
  return `/dashboard/reservations?highlight=${encodeURIComponent(reservationId)}`;
}
