import type { OpeningHours } from "@/src/lib/utils";

/** Clés alignées sur `OpeningHours` (`mon`, `tue`, …). */
const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function parseHm(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** null = horaires inconnus, true = ouvert maintenant, false = fermé */
export function isRestaurantOpenAt(openingHours: OpeningHours | null | undefined, at: Date): boolean | null {
  if (!openingHours) return null;
  const key = WEEKDAY_KEYS[at.getDay()];
  const ranges = openingHours[key];
  if (!ranges?.length) return false;
  const nowMin = at.getHours() * 60 + at.getMinutes();
  for (const range of ranges) {
    const start = parseHm(range.start);
    const end = parseHm(range.end);
    if (start === null || end === null) continue;
    if (end > start) {
      if (nowMin >= start && nowMin < end) return true;
    } else {
      if (nowMin >= start || nowMin < end) return true;
    }
  }
  return false;
}

export function openStatusLabel(openingHours: OpeningHours | null | undefined, at = new Date()): string {
  const open = isRestaurantOpenAt(openingHours, at);
  if (open === null) return "Horaires sur la page";
  return open ? "Ouvert aujourd'hui" : "Fermé aujourd'hui";
}

function formatHmShort(value: string): string {
  const m = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!m) return value.trim();
  const h = m[1].padStart(2, "0");
  const min = m[2];
  return `${h}:${min}`;
}

function formatRangeShort(range: { start: string; end: string }): string {
  return `${formatHmShort(range.start)}–${formatHmShort(range.end)}`;
}

/** Libellé orienté conversion — ex. « Ouvert ce soir · 18:00–22:00 » */
export function tonightServiceLabel(
  openingHours: OpeningHours | null | undefined,
  at = new Date(),
): string | null {
  if (!openingHours) return null;
  const key = WEEKDAY_KEYS[at.getDay()];
  const ranges = openingHours[key];
  if (!ranges?.length) return null;

  const open = isRestaurantOpenAt(openingHours, at);
  const allTimes = ranges.map(formatRangeShort).join(" · ");

  if (open) {
    return `Ouvert maintenant · ${allTimes}`;
  }

  const hour = at.getHours();
  const evening = ranges.filter((r) => {
    const start = parseHm(r.start);
    return start !== null && start >= 16 * 60;
  });
  const eveningTimes = evening.map(formatRangeShort).join(" · ");

  if (evening.length > 0 && hour >= 14) {
    return `Ouvert ce soir · ${eveningTimes || allTimes}`;
  }

  if (evening.length > 0 && ranges.length > 1) {
    return `Aujourd'hui · ${allTimes}`;
  }

  if (evening.length === 1) {
    return `Ce soir · ${eveningTimes}`;
  }

  return `Aujourd'hui · ${allTimes}`;
}
