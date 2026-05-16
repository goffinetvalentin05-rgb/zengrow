import { addMinutes } from "date-fns";
import {
  calendarYmdInBusinessTz,
  clockHmInBusinessTz,
  normalizeReservationDateYmd,
  reservationSlotEndInBusinessTz,
  reservationStartInBusinessTz,
} from "@/src/lib/date/business-calendar";

export type TerraceOccupancyReservation = {
  guests: number;
  reservation_date: string;
  reservation_time: string;
  status: string;
  zone?: string | null;
};

const ACTIVE_STATUSES = new Set(["pending", "confirmed"]);

function intervalsOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

/** Couverts terrasse actifs chevauchant la fenêtre [windowStart, windowEnd). */
export function sumTerraceCoversOverlappingWindow(
  reservations: TerraceOccupancyReservation[],
  windowStart: Date,
  windowEnd: Date,
  durationMinutes: number,
): number {
  let total = 0;
  for (const row of reservations) {
    if (row.zone !== "terrace") continue;
    if (!ACTIVE_STATUSES.has(row.status)) continue;

    const start = reservationStartInBusinessTz(row.reservation_date, row.reservation_time);
    const end = reservationSlotEndInBusinessTz(
      row.reservation_date,
      row.reservation_time,
      durationMinutes,
    );
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) continue;
    if (!intervalsOverlap(start, end, windowStart, windowEnd)) continue;

    total += row.guests;
  }
  return total;
}

/** Couverts terrasse occupés « maintenant » (chevauchement avec le créneau courant). */
export function countTerraceCoversNow(
  reservations: TerraceOccupancyReservation[],
  durationMinutes: number,
  ref: Date = new Date(),
): number {
  const todayYmd = calendarYmdInBusinessTz(ref);
  const nowHm = clockHmInBusinessTz(ref);
  const windowStart = reservationStartInBusinessTz(todayYmd, nowHm);
  const windowEnd = addMinutes(windowStart, Math.max(1, durationMinutes));

  const todayRows = reservations.filter(
    (r) => normalizeReservationDateYmd(r.reservation_date) === todayYmd,
  );

  return sumTerraceCoversOverlappingWindow(todayRows, windowStart, windowEnd, durationMinutes);
}
