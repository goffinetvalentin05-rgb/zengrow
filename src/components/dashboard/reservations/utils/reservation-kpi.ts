import {
  calendarYmdInBusinessTz,
  isoWeekBoundsInBusinessTz,
  reservationIsAtOrAfterNow,
  reservationStartInBusinessTz,
} from "@/src/lib/date/business-calendar";
import {
  getCoverServicePeriodForReservationTime,
  getLunchDinnerMinuteWindowsForYmd,
  sumExpectedCoversByService,
} from "@/src/lib/restaurant/service-windows";
import type { OpeningHours } from "@/src/lib/utils";
import type { ReservationRow, ReservationStatus } from "@/src/components/dashboard/reservations/types";

const COVERS_STATUSES: ReservationStatus[] = ["pending", "confirmed"];
const ARRIVAL_STATUSES: ReservationStatus[] = ["pending", "confirmed"];
const WEEK_DENOMINATOR_STATUSES: ReservationStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "no-show",
];

export type TodayCoversKpi = {
  totalCovers: number;
  groupCount: number;
  lunchCovers: number;
  dinnerCovers: number;
  hasLunchService: boolean;
  hasDinnerService: boolean;
};

export type TodayFillKpi = {
  fillPercent: number;
  expectedCovers: number;
  maxCovers: number;
};

export type NextArrivalKpi = {
  guestName: string;
  timeLabel: string;
  guests: number;
  minutesUntil: number;
} | null;

export type WeekNoShowKpi = {
  noShowCount: number;
  totalReservations: number;
  ratePercent: number;
};

export function computeTodayCoversKpi(
  reservations: ReservationRow[],
  todayYmd: string,
  openingHours: OpeningHours | null | undefined,
): TodayCoversKpi {
  const rows = reservations.filter(
    (r) => r.reservation_date === todayYmd && COVERS_STATUSES.includes(r.status),
  );
  const { lunch, dinner } = getLunchDinnerMinuteWindowsForYmd(todayYmd, openingHours);
  const { expectedLunchCovers, expectedDinnerCovers } = sumExpectedCoversByService({
    rows,
    lunch,
    dinner,
  });
  const totalCovers = rows.reduce((sum, r) => sum + r.guests, 0);
  return {
    totalCovers,
    groupCount: rows.length,
    lunchCovers: expectedLunchCovers,
    dinnerCovers: expectedDinnerCovers,
    hasLunchService: lunch != null,
    hasDinnerService: dinner != null,
  };
}

export function computeTodayFillKpi(
  covers: TodayCoversKpi,
  restaurantCapacity: number,
): TodayFillKpi {
  const maxCovers = Math.max(1, restaurantCapacity * 2);
  const expectedCovers = covers.totalCovers;
  const fillPercent = Math.min(100, Math.round((expectedCovers / maxCovers) * 100));
  return { fillPercent, expectedCovers, maxCovers };
}

export function computeNextArrivalKpi(
  reservations: ReservationRow[],
  todayYmd: string,
  ref: Date = new Date(),
): NextArrivalKpi {
  const candidates = reservations
    .filter(
      (r) =>
        r.reservation_date === todayYmd &&
        ARRIVAL_STATUSES.includes(r.status) &&
        reservationIsAtOrAfterNow(r.reservation_date, r.reservation_time, ref),
    )
    .sort(
      (a, b) =>
        reservationStartInBusinessTz(a.reservation_date, a.reservation_time).getTime() -
        reservationStartInBusinessTz(b.reservation_date, b.reservation_time).getTime(),
    );

  const next = candidates[0];
  if (!next) return null;

  const start = reservationStartInBusinessTz(next.reservation_date, next.reservation_time);
  const minutesUntil = Math.max(0, Math.round((start.getTime() - ref.getTime()) / 60_000));
  const timeLabel = next.reservation_time.trim().slice(0, 5);

  return {
    guestName: next.guest_name,
    timeLabel,
    guests: next.guests,
    minutesUntil,
  };
}

export function computeWeekNoShowKpi(
  reservations: ReservationRow[],
  ref: Date = new Date(),
): WeekNoShowKpi {
  const { start, end } = isoWeekBoundsInBusinessTz(ref);
  const inWeek = reservations.filter((r) => r.reservation_date >= start && r.reservation_date <= end);
  const noShowCount = inWeek.filter((r) => r.status === "no-show").length;
  const totalReservations = inWeek.filter((r) =>
    WEEK_DENOMINATOR_STATUSES.includes(r.status),
  ).length;
  const ratePercent =
    totalReservations > 0 ? Math.round((noShowCount / totalReservations) * 100) : 0;
  return { noShowCount, totalReservations, ratePercent };
}

export function formatCoversSubline(covers: TodayCoversKpi): string {
  const lunchPart = covers.hasLunchService ? `${covers.lunchCovers} couverts midi` : null;
  const dinnerPart = covers.hasDinnerService ? `${covers.dinnerCovers} couverts soir` : null;
  const servicePart = [lunchPart, dinnerPart].filter(Boolean).join(" · ");
  return `${covers.groupCount} groupes${servicePart ? ` / ${servicePart}` : ""}`;
}

/** Utilitaire pour stats créneau (étape 4). */
export function reservationTimePeriod(
  ymd: string,
  time: string,
  openingHours: OpeningHours | null | undefined,
): "lunch" | "dinner" | null {
  const { lunch, dinner } = getLunchDinnerMinuteWindowsForYmd(ymd, openingHours);
  return getCoverServicePeriodForReservationTime(time, lunch, dinner);
}
