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
