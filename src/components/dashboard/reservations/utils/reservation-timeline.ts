import { reservationTimePeriod } from "@/src/components/dashboard/reservations/utils/reservation-kpi";
import { minutesToShortHmLabel } from "@/src/components/dashboard/reservations/utils/reservation-slot-stats";
import type { ReservationRow, ReservationStatus } from "@/src/components/dashboard/reservations/types";
import { clockHmInBusinessTz, calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";
import type { MinuteWindow } from "@/src/lib/restaurant/service-windows";
import { getLunchDinnerMinuteWindowsForYmd } from "@/src/lib/restaurant/service-windows";
import type { OpeningHours } from "@/src/lib/utils";
import { openingTimeToMinutes } from "@/src/lib/utils";

const DEFAULT_AXIS_START = 11 * 60;
const DEFAULT_AXIS_END = 23 * 60;
const OVERLOAD_STEP_MIN = 15;
const LARGE_PARTY_GUESTS = 6;

export type TimelineBlockLayout = {
  reservation: ReservationRow;
  leftPercent: number;
  widthPercent: number;
  lane: number;
  tooltip: string;
};

export type TimelineOverloadSegment = {
  leftPercent: number;
  widthPercent: number;
};

export type TimelineServiceRowLayout = {
  key: "lunch" | "dinner";
  label: string;
  active: boolean;
  axisStartMin: number;
  axisEndMin: number;
  blocks: TimelineBlockLayout[];
  laneCount: number;
  hourTicks: { label: string; leftPercent: number }[];
  overloadSegments: TimelineOverloadSegment[];
  nowLeftPercent: number | null;
};

export type TimelineLayout = {
  rows: TimelineServiceRowLayout[];
  hasOverload: boolean;
  isToday: boolean;
};

export const TIMELINE_BLOCK_HEIGHT_PX = 34;
export const TIMELINE_LANE_GAP_PX = 6;

export function timelineStatusBlockClass(status: ReservationStatus): string {
  switch (status) {
    case "confirmed":
      return "border-emerald-400/50 bg-emerald-600/90 text-white";
    case "pending":
      return "border-zg-accent/50 bg-zg-accent/90 text-white";
    case "cancelled":
    case "refused":
      return "border-zg-border bg-zg-surface-elevated/95 text-zg-text-muted line-through";
    case "no-show":
      return "border-zg-border bg-zg-neutral-badge-bg text-zg-text-muted";
    case "completed":
      return "border-zg-info/40 bg-zg-info/80 text-white";
    default:
      return "border-zg-border bg-zg-surface-elevated text-zg-fg";
  }
}

function reservationSpanMinutes(
  row: ReservationRow,
  durationMinutes: number,
): { startMin: number; endMin: number } | null {
  const startMin = openingTimeToMinutes(row.reservation_time);
  if (!Number.isFinite(startMin)) return null;
  return { startMin, endMin: startMin + Math.max(15, durationMinutes) };
}

function percentInAxis(valueMin: number, axisStart: number, axisEnd: number): number {
  const span = Math.max(1, axisEnd - axisStart);
  return ((valueMin - axisStart) / span) * 100;
}

function buildHourTicks(axisStart: number, axisEnd: number): { label: string; leftPercent: number }[] {
  const ticks: { label: string; leftPercent: number }[] = [];
  const firstHour = Math.ceil(axisStart / 60) * 60;
  for (let min = firstHour; min <= axisEnd; min += 60) {
    if (min < axisStart) continue;
    ticks.push({
      label: minutesToShortHmLabel(min),
      leftPercent: percentInAxis(min, axisStart, axisEnd),
    });
  }
  return ticks;
}

function assignLanes(
  items: { id: string; startMin: number; endMin: number; reservation: ReservationRow }[],
  axisStart: number,
  axisEnd: number,
): TimelineBlockLayout[] {
  const sorted = [...items].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);
  const laneEnds: number[] = [];
  const blocks: TimelineBlockLayout[] = [];

  for (const item of sorted) {
    let lane = 0;
    for (; lane < laneEnds.length; lane += 1) {
      if (item.startMin >= laneEnds[lane]) break;
    }
    if (lane === laneEnds.length) laneEnds.push(item.endMin);
    else laneEnds[lane] = item.endMin;

    const clampedStart = Math.max(item.startMin, axisStart);
    const clampedEnd = Math.min(item.endMin, axisEnd);
    const leftPercent = percentInAxis(clampedStart, axisStart, axisEnd);
    const widthPercent = Math.max(
      1.5,
      percentInAxis(clampedEnd, axisStart, axisEnd) - leftPercent,
    );

    const timeLabel = item.reservation.reservation_time.slice(0, 5);
    blocks.push({
      reservation: item.reservation,
      leftPercent,
      widthPercent,
      lane,
      tooltip: `${item.reservation.guest_name} · ${item.reservation.guests} pers. · ${timeLabel}`,
    });
  }

  return blocks;
}

function computeOverloadSegments(
  items: { startMin: number; endMin: number; guests: number }[],
  axisStart: number,
  axisEnd: number,
  capacity: number,
): TimelineOverloadSegment[] {
  if (capacity <= 0) return [];
  const flags: boolean[] = [];
  for (let t = axisStart; t < axisEnd; t += OVERLOAD_STEP_MIN) {
    let load = 0;
    for (const item of items) {
      if (item.startMin < t + OVERLOAD_STEP_MIN && item.endMin > t) {
        load += item.guests;
      }
    }
    flags.push(load > capacity);
  }

  const segments: TimelineOverloadSegment[] = [];
  let i = 0;
  while (i < flags.length) {
    if (!flags[i]) {
      i += 1;
      continue;
    }
    const startIdx = i;
    while (i < flags.length && flags[i]) i += 1;
    const segStart = axisStart + startIdx * OVERLOAD_STEP_MIN;
    const segEnd = axisStart + i * OVERLOAD_STEP_MIN;
    segments.push({
      leftPercent: percentInAxis(segStart, axisStart, axisEnd),
      widthPercent: Math.max(1, percentInAxis(segEnd, axisStart, axisEnd) - percentInAxis(segStart, axisStart, axisEnd)),
    });
  }
  return segments;
}

function nowLeftPercentForRow(
  axisStartMin: number,
  axisEndMin: number,
  ymd: string,
  ref: Date,
): number | null {
  if (ymd !== calendarYmdInBusinessTz(ref)) return null;
  const nowMin = openingTimeToMinutes(clockHmInBusinessTz(ref));
  if (!Number.isFinite(nowMin) || nowMin < axisStartMin || nowMin > axisEndMin) return null;
  return percentInAxis(nowMin, axisStartMin, axisEndMin);
}

function buildServiceRow(
  key: "lunch" | "dinner",
  label: string,
  window: MinuteWindow | null,
  rows: ReservationRow[],
  durationMinutes: number,
  capacity: number,
  ymd: string,
  ref: Date,
): TimelineServiceRowLayout {
  if (!window) {
    return {
      key,
      label,
      active: false,
      axisStartMin: DEFAULT_AXIS_START,
      axisEndMin: DEFAULT_AXIS_END,
      blocks: [],
      laneCount: 1,
      hourTicks: [],
      overloadSegments: [],
      nowLeftPercent: null,
    };
  }

  const padding = 15;
  const axisStartMin = Math.max(DEFAULT_AXIS_START, window.startMin - padding);
  const axisEndMin = Math.min(DEFAULT_AXIS_END, window.endMin + padding);

  const spanItems = rows
    .map((row) => {
      const span = reservationSpanMinutes(row, durationMinutes);
      if (!span) return null;
      if (span.endMin <= axisStartMin || span.startMin >= axisEndMin) return null;
      return { id: row.id, ...span, reservation: row, guests: row.guests };
    })
    .filter((item): item is NonNullable<typeof item> => item != null);

  const blocks = assignLanes(spanItems, axisStartMin, axisEndMin);
  const laneCount = Math.max(1, ...blocks.map((b) => b.lane + 1));

  return {
    key,
    label,
    active: true,
    axisStartMin,
    axisEndMin,
    blocks,
    laneCount,
    hourTicks: buildHourTicks(axisStartMin, axisEndMin),
    overloadSegments: computeOverloadSegments(spanItems, axisStartMin, axisEndMin, capacity),
    nowLeftPercent: nowLeftPercentForRow(axisStartMin, axisEndMin, ymd, ref),
  };
}

export function computeTimelineLayout(params: {
  rows: ReservationRow[];
  ymd: string;
  openingHours: OpeningHours | null | undefined;
  durationMinutes: number;
  restaurantCapacity: number;
  ref?: Date;
}): TimelineLayout {
  const { lunch, dinner } = getLunchDinnerMinuteWindowsForYmd(params.ymd, params.openingHours);
  const lunchRows: ReservationRow[] = [];
  const dinnerRows: ReservationRow[] = [];

  for (const row of params.rows) {
    const period = reservationTimePeriod(params.ymd, row.reservation_time, params.openingHours);
    if (period === "lunch") lunchRows.push(row);
    else if (period === "dinner") dinnerRows.push(row);
    else if (lunch && !dinner) lunchRows.push(row);
    else if (dinner) dinnerRows.push(row);
  }

  const ref = params.ref ?? new Date();
  const timelineRows = [
    buildServiceRow(
      "lunch",
      "Midi",
      lunch,
      lunchRows,
      params.durationMinutes,
      params.restaurantCapacity,
      params.ymd,
      ref,
    ),
    buildServiceRow(
      "dinner",
      "Soir",
      dinner,
      dinnerRows,
      params.durationMinutes,
      params.restaurantCapacity,
      params.ymd,
      ref,
    ),
  ];

  const hasOverload = timelineRows.some((r) => r.overloadSegments.length > 0);
  const isToday = params.ymd === calendarYmdInBusinessTz(ref);

  return { rows: timelineRows, hasOverload, isToday };
}

export function showGuestsOnBlock(guests: number): boolean {
  return guests >= LARGE_PARTY_GUESTS;
}
