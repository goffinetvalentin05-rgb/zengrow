import { addMinutes, endOfISOWeek, startOfISOWeek } from "date-fns";
import { formatInTimeZone, toDate, toZonedTime } from "date-fns-tz";

const ISO_DOW_TO_OPENING_KEY = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

/** Fuseau utilisé pour « aujourd’hui », semaine ISO et prochaines réservations (défaut : Europe/Paris). */
export function businessCalendarTimeZone(): string {
  return process.env.BUSINESS_CALENDAR_TZ?.trim() || "Europe/Paris";
}

/** Date civile YYYY-MM-DD dans le fuseau métier, à l’instant `ref`. */
export function calendarYmdInBusinessTz(ref: Date = new Date()): string {
  return formatInTimeZone(ref, businessCalendarTimeZone(), "yyyy-MM-dd");
}

/** Clé jour `mon`…`sun` alignée sur `opening_hours` / calendrier métier (YYYY-MM-DD). */
export function weekdayKeyFromYmdInBusinessTz(ymd: string): (typeof ISO_DOW_TO_OPENING_KEY)[number] {
  const tz = businessCalendarTimeZone();
  const ref = toDate(`${ymd}T12:00:00`, { timeZone: tz });
  const isoDow = Number.parseInt(formatInTimeZone(ref, tz, "i"), 10);
  if (!Number.isFinite(isoDow) || isoDow < 1 || isoDow > 7) return "mon";
  return ISO_DOW_TO_OPENING_KEY[isoDow - 1];
}

/** Heure locale HH:mm (24 h) dans le fuseau métier. */
export function clockHmInBusinessTz(ref: Date = new Date()): string {
  return formatInTimeZone(ref, businessCalendarTimeZone(), "HH:mm");
}

/** Lundi et dimanche (YYYY-MM-DD) de la semaine ISO contenant `ref`, dans le fuseau métier. */
export function isoWeekBoundsInBusinessTz(ref: Date = new Date()): { start: string; end: string } {
  const tz = businessCalendarTimeZone();
  const zoned = toZonedTime(ref, tz);
  const mon = startOfISOWeek(zoned);
  const sun = endOfISOWeek(zoned);
  return {
    start: formatInTimeZone(mon, tz, "yyyy-MM-dd"),
    end: formatInTimeZone(sun, tz, "yyyy-MM-dd"),
  };
}

/** Instant de réservation (date + heure affichées) comparé à maintenant dans le fuseau métier (chaînes triables). */
export function reservationIsAtOrAfterNow(
  reservationDate: string,
  reservationTime: string,
  ref: Date = new Date(),
): boolean {
  const todayYmd = calendarYmdInBusinessTz(ref);
  const nowHm = clockHmInBusinessTz(ref);
  const hm = reservationTime.trim().slice(0, 5);
  if (reservationDate > todayYmd) return true;
  if (reservationDate < todayYmd) return false;
  return hm >= nowHm;
}

/** Extrait YYYY-MM-DD (colonne date ou préfixe ISO). */
export function normalizeReservationDateYmd(reservationDate: string): string {
  const t = reservationDate.trim();
  if (t.length >= 10 && t[4] === "-" && t[7] === "-") return t.slice(0, 10);
  return t.slice(0, 10);
}

/** Normalise une heure SQL / HH:mm vers HH:mm:ss pour parsing fuseau métier. */
export function normalizeReservationTimeHms(reservationTime: string): string {
  const t = reservationTime.trim();
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(t);
  if (!m) return "00:00:00";
  const hh = m[1].padStart(2, "0");
  const mm = m[2].padStart(2, "0");
  const ss = (m[3] ?? "00").padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

/** Début du créneau (date + heure affichées) interprétés dans le fuseau métier. */
export function reservationStartInBusinessTz(reservationDate: string, reservationTime: string): Date {
  const ymd = normalizeReservationDateYmd(reservationDate);
  const hms = normalizeReservationTimeHms(reservationTime);
  return toDate(`${ymd}T${hms}`, { timeZone: businessCalendarTimeZone() });
}

/** Fin du créneau = début + durée du repas (minutes), toujours dans le calendrier métier. */
export function reservationSlotEndInBusinessTz(
  reservationDate: string,
  reservationTime: string,
  durationMinutes: number,
): Date {
  const start = reservationStartInBusinessTz(reservationDate, reservationTime);
  if (Number.isNaN(start.getTime())) return start;
  return addMinutes(start, Math.max(0, durationMinutes));
}

/** True si l’instant `ref` est au-delà de la fin du créneau (heure + durée repas), fuseau métier. */
export function isReservationSlotPastInBusinessTz(
  reservationDate: string,
  reservationTime: string,
  durationMinutes: number,
  ref: Date = new Date(),
): boolean {
  const end = reservationSlotEndInBusinessTz(reservationDate, reservationTime, durationMinutes);
  if (Number.isNaN(end.getTime())) return true;
  return ref.getTime() >= end.getTime();
}
