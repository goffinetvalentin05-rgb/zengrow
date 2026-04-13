import { weekdayKeyFromYmdInBusinessTz } from "@/src/lib/date/business-calendar";
import type { OpeningHours, OpeningHoursRange } from "@/src/lib/utils";
import { getDefaultOpeningHours, openingTimeToMinutes } from "@/src/lib/utils";

export type MinuteWindow = { startMin: number; endMin: number };

const LUNCH_DINNER_START_CUTOFF_MIN = 16 * 60;

function normalizeOpeningRange(range: OpeningHoursRange): MinuteWindow | null {
  const startRaw = range?.start?.trim() ?? "";
  const endRaw = range?.end?.trim() ?? "";
  if (!startRaw || !endRaw) return null;
  const startMin = openingTimeToMinutes(startRaw);
  const endMin = openingTimeToMinutes(endRaw);
  if (!Number.isFinite(startMin) || !Number.isFinite(endMin)) return null;
  if (startMin > endMin) return null;
  return { startMin, endMin };
}

function windowsAreEqual(a: MinuteWindow, b: MinuteWindow): boolean {
  return a.startMin === b.startMin && a.endMin === b.endMin;
}

function lunchDinnerFromSingleRange(w: MinuteWindow): { lunch: MinuteWindow | null; dinner: MinuteWindow | null } {
  if (w.startMin < LUNCH_DINNER_START_CUTOFF_MIN) {
    return { lunch: w, dinner: null };
  }
  return { lunch: null, dinner: w };
}

/**
 * Fenêtres [début, fin] en minutes (bornes inclusives) pour midi et soir,
 * d'après les plages du jour `ymd` dans le fuseau métier.
 *
 * - 2 plages ou plus : première plage = midi, dernière = soir.
 * - 1 plage : midi si début avant 16:00, sinon soir.
 */
export function getLunchDinnerMinuteWindowsForYmd(
  ymd: string,
  openingHours: OpeningHours | null | undefined,
): { lunch: MinuteWindow | null; dinner: MinuteWindow | null } {
  const oh = openingHours ?? getDefaultOpeningHours();
  const dayKey = weekdayKeyFromYmdInBusinessTz(ymd);
  const ranges = oh[dayKey] ?? [];

  if (ranges.length === 0) {
    return { lunch: null, dinner: null };
  }

  if (ranges.length === 1) {
    const w = normalizeOpeningRange(ranges[0]);
    if (!w) return { lunch: null, dinner: null };
    return lunchDinnerFromSingleRange(w);
  }

  const lunch = normalizeOpeningRange(ranges[0]);
  const dinner = normalizeOpeningRange(ranges[ranges.length - 1]);

  if (lunch && dinner && windowsAreEqual(lunch, dinner)) {
    return lunchDinnerFromSingleRange(lunch);
  }

  return { lunch, dinner };
}

/** Midi prioritaire si chevauchement des plages. */
export function getCoverServicePeriodForReservationTime(
  reservationTime: string,
  lunch: MinuteWindow | null,
  dinner: MinuteWindow | null,
): "lunch" | "dinner" | null {
  const hm = openingTimeToMinutes(reservationTime.trim());
  if (!Number.isFinite(hm)) return null;
  if (lunch && hm >= lunch.startMin && hm <= lunch.endMin) return "lunch";
  if (dinner && hm >= dinner.startMin && hm <= dinner.endMin) return "dinner";
  return null;
}

export function sumExpectedCoversByService(params: {
  rows: { guests: number | null; reservation_time: string }[];
  lunch: MinuteWindow | null;
  dinner: MinuteWindow | null;
}): { expectedLunchCovers: number; expectedDinnerCovers: number } {
  let expectedLunchCovers = 0;
  let expectedDinnerCovers = 0;
  for (const row of params.rows) {
    const g = row.guests ?? 0;
    const period = getCoverServicePeriodForReservationTime(row.reservation_time, params.lunch, params.dinner);
    if (period === "lunch") expectedLunchCovers += g;
    else if (period === "dinner") expectedDinnerCovers += g;
  }
  return { expectedLunchCovers, expectedDinnerCovers };
}
