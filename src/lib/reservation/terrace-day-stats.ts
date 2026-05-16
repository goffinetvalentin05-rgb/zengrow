import { addMinutes } from "date-fns";
import {
  calendarYmdInBusinessTz,
  clockHmInBusinessTz,
  normalizeReservationDateYmd,
  reservationSlotEndInBusinessTz,
  reservationStartInBusinessTz,
} from "@/src/lib/date/business-calendar";
import {
  countTerraceCoversNow,
  type TerraceOccupancyReservation,
} from "@/src/lib/reservation/terrace-occupancy";

export type TerraceDayReservation = {
  id: string;
  guest_name: string;
  reservation_time: string;
  guests: number;
  status: string;
};

export type TerraceDaySummary = {
  dateYmd: string;
  reservations: TerraceDayReservation[];
  reservationCount: number;
  bookedCovers: number;
  occupiedNow: number;
};

export function sumZoneCoversForDate(
  reservations: TerraceOccupancyReservation[],
  zone: "interior" | "terrace",
  dateYmd: string,
): number {
  return reservations
    .filter(
      (r) =>
        normalizeReservationDateYmd(r.reservation_date) === dateYmd &&
        (r.zone === "terrace" ? "terrace" : "interior") === zone &&
        (r.status === "pending" || r.status === "confirmed"),
    )
    .reduce((sum, r) => sum + r.guests, 0);
}

export function countZoneCoversNow(
  reservations: TerraceOccupancyReservation[],
  zone: "interior" | "terrace",
  durationMinutes: number,
  ref: Date = new Date(),
): number {
  const todayYmd = calendarYmdInBusinessTz(ref);
  const filtered = reservations.map((r) => ({
    ...r,
    zone: r.zone === "terrace" ? "terrace" : "interior",
  }));

  if (zone === "terrace") {
    return countTerraceCoversNow(filtered, durationMinutes, ref);
  }

  const nowHm = clockHmInBusinessTz(ref);
  const windowStart = reservationStartInBusinessTz(todayYmd, nowHm);
  const windowEnd = addMinutes(windowStart, Math.max(1, durationMinutes));

  let total = 0;
  for (const row of filtered) {
    if (row.zone !== "interior") continue;
    if (row.status !== "pending" && row.status !== "confirmed") continue;
    if (normalizeReservationDateYmd(row.reservation_date) !== todayYmd) continue;

    const start = reservationStartInBusinessTz(row.reservation_date, row.reservation_time);
    const end = reservationSlotEndInBusinessTz(row.reservation_date, row.reservation_time, durationMinutes);
    if (start.getTime() < windowEnd.getTime() && end.getTime() > windowStart.getTime()) {
      total += row.guests;
    }
  }
  return total;
}

export function summarizeTerraceDay(
  reservations: Array<{
    id: string;
    guest_name: string;
    reservation_time: string;
    guests: number;
    status: string;
    zone?: string | null;
    reservation_date: string;
  }>,
  durationMinutes: number,
  dateYmd: string = calendarYmdInBusinessTz(),
): TerraceDaySummary {
  const terraceRows = reservations.filter(
    (r) =>
      r.zone === "terrace" &&
      normalizeReservationDateYmd(r.reservation_date) === dateYmd &&
      (r.status === "pending" || r.status === "confirmed"),
  );

  const occupancyRows: TerraceOccupancyReservation[] = terraceRows.map((r) => ({
    guests: r.guests,
    reservation_date: r.reservation_date,
    reservation_time: r.reservation_time,
    status: r.status,
    zone: r.zone,
  }));

  return {
    dateYmd,
    reservations: terraceRows.map((r) => ({
      id: r.id,
      guest_name: r.guest_name,
      reservation_time: r.reservation_time,
      guests: r.guests,
      status: r.status,
    })),
    reservationCount: terraceRows.length,
    bookedCovers: terraceRows.reduce((sum, r) => sum + r.guests, 0),
    occupiedNow: countTerraceCoversNow(occupancyRows, durationMinutes),
  };
}

export function resolveInteriorCapacityMax(settings: {
  reservation_mode?: string | null;
  max_covers_per_slot?: number | null;
  restaurant_capacity?: number | null;
  service_lunch_max_covers?: number | null;
  service_dinner_max_covers?: number | null;
}): number {
  const lunch = settings.service_lunch_max_covers ?? 40;
  const dinner = settings.service_dinner_max_covers ?? 40;
  const fallback = settings.max_covers_per_slot ?? settings.restaurant_capacity ?? 40;
  if (settings.reservation_mode === "floor_plan") {
    return Math.max(1, fallback);
  }
  return Math.max(1, lunch, dinner, fallback);
}
