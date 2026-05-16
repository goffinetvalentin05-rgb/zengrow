import { weekdayKeyFromYmdInBusinessTz } from "@/src/lib/date/business-calendar";
import { reservationTimePeriod } from "@/src/components/dashboard/reservations/utils/reservation-kpi";
import type { ReservationRow, ReservationStatus } from "@/src/components/dashboard/reservations/types";
import type { MinuteWindow } from "@/src/lib/restaurant/service-windows";
import { getLunchDinnerMinuteWindowsForYmd } from "@/src/lib/restaurant/service-windows";
import type { OpeningHours } from "@/src/lib/utils";
import { openingTimeToMinutes } from "@/src/lib/utils";

const COVERS_STATUSES: ReservationStatus[] = ["pending", "confirmed"];

const SLOT_STEP_MIN = 30;

export type SlotBucket = {
  label: string;
  covers: number;
  startMin: number;
};

export type ServiceSlotStats = {
  key: "lunch" | "dinner";
  title: string;
  active: boolean;
  covers: number;
  maxCovers: number;
  fillPercent: number;
  groupCount: number;
  peakLabel: string;
  buckets: SlotBucket[];
};

export function minutesToShortHmLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

function buildBucketsForWindow(window: MinuteWindow | null): SlotBucket[] {
  if (!window) return [];
  const buckets: SlotBucket[] = [];
  for (let start = window.startMin; start < window.endMin; start += SLOT_STEP_MIN) {
    buckets.push({
      label: minutesToShortHmLabel(start),
      covers: 0,
      startMin: start,
    });
  }
  return buckets;
}

function assignCoversToBuckets(buckets: SlotBucket[], guests: number, timeMin: number): void {
  if (buckets.length === 0 || !Number.isFinite(timeMin)) return;
  let target = buckets[0];
  for (const bucket of buckets) {
    if (timeMin >= bucket.startMin) target = bucket;
    else break;
  }
  target.covers += guests;
}

function peakLabelFromBuckets(buckets: SlotBucket[]): string {
  if (buckets.length === 0) return "—";
  let peak = buckets[0];
  for (const bucket of buckets) {
    if (bucket.covers > peak.covers) peak = bucket;
  }
  if (peak.covers <= 0) return "—";
  return minutesToShortHmLabel(peak.startMin);
}

function computeServiceStats(
  key: "lunch" | "dinner",
  title: string,
  window: MinuteWindow | null,
  rows: ReservationRow[],
  maxCovers: number,
): ServiceSlotStats {
  const buckets = buildBucketsForWindow(window);
  let covers = 0;

  for (const row of rows) {
    const timeMin = openingTimeToMinutes(row.reservation_time);
    assignCoversToBuckets(buckets, row.guests, timeMin);
    covers += row.guests;
  }

  const fillPercent =
    maxCovers > 0 ? Math.min(100, Math.round((covers / maxCovers) * 100)) : 0;

  return {
    key,
    title,
    active: window != null,
    covers,
    maxCovers,
    fillPercent,
    groupCount: rows.length,
    peakLabel: peakLabelFromBuckets(buckets),
    buckets,
  };
}

export function computeDayServiceSlotStats(params: {
  reservations: ReservationRow[];
  ymd: string;
  openingHours: OpeningHours | null | undefined;
  restaurantCapacity: number;
}): { lunch: ServiceSlotStats; dinner: ServiceSlotStats } {
  const { lunch: lunchWindow, dinner: dinnerWindow } = getLunchDinnerMinuteWindowsForYmd(
    params.ymd,
    params.openingHours,
  );

  const dayRows = params.reservations.filter(
    (r) => r.reservation_date === params.ymd && COVERS_STATUSES.includes(r.status),
  );

  const lunchRows: ReservationRow[] = [];
  const dinnerRows: ReservationRow[] = [];

  for (const row of dayRows) {
    const period = reservationTimePeriod(params.ymd, row.reservation_time, params.openingHours);
    if (period === "lunch") lunchRows.push(row);
    else if (period === "dinner") dinnerRows.push(row);
    else if (lunchWindow && !dinnerWindow) lunchRows.push(row);
    else if (dinnerWindow) dinnerRows.push(row);
  }

  const cap = Math.max(1, params.restaurantCapacity);

  return {
    lunch: computeServiceStats("lunch", "Service Midi", lunchWindow, lunchRows, cap),
    dinner: computeServiceStats("dinner", "Service Soir", dinnerWindow, dinnerRows, cap),
  };
}

export type PeriodServiceTotals = {
  lunchCovers: number;
  lunchGroups: number;
  dinnerCovers: number;
  dinnerGroups: number;
  weekdayCovers: number;
  weekendCovers: number;
};

export function computePeriodServiceTotals(params: {
  reservations: ReservationRow[];
  fromYmd: string;
  toYmd: string;
  openingHours: OpeningHours | null | undefined;
}): PeriodServiceTotals {
  const inRange = params.reservations.filter(
    (r) =>
      r.reservation_date >= params.fromYmd &&
      r.reservation_date <= params.toYmd &&
      COVERS_STATUSES.includes(r.status),
  );

  let lunchCovers = 0;
  let lunchGroups = 0;
  let dinnerCovers = 0;
  let dinnerGroups = 0;
  let weekdayCovers = 0;
  let weekendCovers = 0;

  for (const row of inRange) {
    const period = reservationTimePeriod(row.reservation_date, row.reservation_time, params.openingHours);
    if (period === "lunch") {
      lunchCovers += row.guests;
      lunchGroups += 1;
    } else if (period === "dinner") {
      dinnerCovers += row.guests;
      dinnerGroups += 1;
    }
    const dayKey = weekdayKeyFromYmdInBusinessTz(row.reservation_date);
    const isWeekend = dayKey === "sat" || dayKey === "sun";
    if (isWeekend) weekendCovers += row.guests;
    else weekdayCovers += row.guests;
  }

  return {
    lunchCovers,
    lunchGroups,
    dinnerCovers,
    dinnerGroups,
    weekdayCovers,
    weekendCovers,
  };
}
