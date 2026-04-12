import { endOfISOWeek, startOfISOWeek } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

/** Fuseau utilisé pour « aujourd’hui », semaine ISO et prochaines réservations (défaut : Europe/Paris). */
export function businessCalendarTimeZone(): string {
  return process.env.BUSINESS_CALENDAR_TZ?.trim() || "Europe/Paris";
}

/** Date civile YYYY-MM-DD dans le fuseau métier, à l’instant `ref`. */
export function calendarYmdInBusinessTz(ref: Date = new Date()): string {
  return formatInTimeZone(ref, businessCalendarTimeZone(), "yyyy-MM-dd");
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
