import { addMinutes, endOfISOWeek, endOfMonth, startOfISOWeek, startOfMonth, subDays } from "date-fns";
import { fr } from "date-fns/locale";
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

/** Début et fin du mois civil (YYYY-MM-DD) dans le fuseau métier + libellé « mois année ». */
export function monthBoundsInBusinessTz(ref: Date = new Date()): { startYmd: string; endYmd: string; label: string } {
  const tz = businessCalendarTimeZone();
  const z = toZonedTime(ref, tz);
  const start = startOfMonth(z);
  const end = endOfMonth(z);
  return {
    startYmd: formatInTimeZone(start, tz, "yyyy-MM-dd"),
    endYmd: formatInTimeZone(end, tz, "yyyy-MM-dd"),
    label: formatInTimeZone(start, tz, "LLLL yyyy", { locale: fr }),
  };
}

/** Liste des YYYY-MM-DD des `n` derniers jours (du plus ancien au plus récent), fuseau métier. */
export function lastNYmdDaysInBusinessTz(n: number, ref: Date = new Date()): string[] {
  const tz = businessCalendarTimeZone();
  const z = toZonedTime(ref, tz);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    out.push(formatInTimeZone(subDays(z, i), tz, "yyyy-MM-dd"));
  }
  return out;
}

/** Instant ISO (début du jour YMD dans le fuseau métier). */
export function startOfBusinessYmdAsUtcIso(ymd: string): string {
  const tz = businessCalendarTimeZone();
  return toDate(`${ymd}T00:00:00`, { timeZone: tz }).toISOString();
}

/** Fin du jour YMD (23:59:59.999) dans le fuseau métier, en ISO UTC. */
export function endOfBusinessYmdAsUtcIso(ymd: string): string {
  const tz = businessCalendarTimeZone();
  return toDate(`${ymd}T23:59:59.999`, { timeZone: tz }).toISOString();
}
