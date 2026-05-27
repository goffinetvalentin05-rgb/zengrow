import type { OpeningHours } from "@/src/lib/utils";
import { isRestaurantOpenAt, WEEKDAY_KEYS } from "@/src/lib/public-page/opening-status";

export type ShowroomAvailability = {
  headline: string;
  timeRange: string | null;
};

function parseHm(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function formatHmShort(value: string): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!m) return value.trim();
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

function formatRangeShort(range: { start: string; end: string }): string {
  return `${formatHmShort(range.start)}–${formatHmShort(range.end)}`;
}

function findActiveRange(
  ranges: { start: string; end: string }[],
  at: Date,
): { start: string; end: string } | null {
  const nowMin = at.getHours() * 60 + at.getMinutes();
  for (const range of ranges) {
    const start = parseHm(range.start);
    const end = parseHm(range.end);
    if (start === null || end === null) continue;
    if (end > start) {
      if (nowMin >= start && nowMin < end) return range;
    } else if (nowMin >= start || nowMin < end) {
      return range;
    }
  }
  return null;
}

function isEveningRange(range: { start: string; end: string }): boolean {
  const start = parseHm(range.start);
  return start !== null && start >= 16 * 60;
}

/** Libellés orientés conversion — une plage horaire max */
export function resolveShowroomAvailability(
  openingHours: OpeningHours | null | undefined,
  options?: { reservationEnabled?: boolean; at?: Date },
): ShowroomAvailability | null {
  const at = options?.at ?? new Date();
  const reservationEnabled = options?.reservationEnabled ?? false;

  if (!openingHours) {
    return reservationEnabled
      ? { headline: "Réservations ouvertes aujourd'hui", timeRange: null }
      : null;
  }

  const key = WEEKDAY_KEYS[at.getDay()];
  const ranges = openingHours[key];
  if (!ranges?.length) return null;

  const open = isRestaurantOpenAt(openingHours, at);
  const eveningRanges = ranges.filter(isEveningRange);
  const hour = at.getHours();

  if (open) {
    const active = findActiveRange(ranges, at);
    if (active) {
      if (isEveningRange(active)) {
        return {
          headline: "Tables disponibles ce soir",
          timeRange: formatRangeShort(active),
        };
      }
      return {
        headline: "Réservations ouvertes aujourd'hui",
        timeRange: formatRangeShort(active),
      };
    }
  }

  if (eveningRanges.length > 0) {
    const slot = eveningRanges[0];
    const headline =
      hour >= 17 ? "Service du soir disponible" : hour >= 14 ? "Tables disponibles ce soir" : "Service du soir disponible";
    return { headline, timeRange: formatRangeShort(slot) };
  }

  if (ranges.length === 1) {
    return { headline: "Ce soir", timeRange: formatRangeShort(ranges[0]) };
  }

  const nowMin = at.getHours() * 60 + at.getMinutes();
  const upcoming = ranges.find((r) => {
    const start = parseHm(r.start);
    return start !== null && start > nowMin;
  });
  if (upcoming) {
    const headline = isEveningRange(upcoming) ? "Service du soir disponible" : "Réservations ouvertes aujourd'hui";
    return { headline, timeRange: formatRangeShort(upcoming) };
  }

  if (reservationEnabled) {
    return { headline: "Réservations ouvertes aujourd'hui", timeRange: null };
  }

  return null;
}
