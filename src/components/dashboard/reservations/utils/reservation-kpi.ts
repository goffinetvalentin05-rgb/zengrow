import { addCalendarDaysYmd } from "@/src/components/dashboard/reservations/utils/reservation-filters";
import { calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";
import {
  getCoverServicePeriodForReservationTime,
  getLunchDinnerMinuteWindowsForYmd,
  sumExpectedCoversByService,
} from "@/src/lib/restaurant/service-windows";
import type { OpeningHours } from "@/src/lib/utils";
import type { ReservationRow, ReservationStatus } from "@/src/components/dashboard/reservations/types";

const COVERS_STATUSES: ReservationStatus[] = ["pending", "confirmed"];
const CONFIRMED_STATUS: ReservationStatus = "confirmed";

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

export type WeekReservationsKpi = {
  reservationCount: number;
  totalCovers: number;
  trendLabel: string;
  trendTone: "success" | "warning" | "muted";
};

export type WeekReservationsTrendTone = WeekReservationsKpi["trendTone"];

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

function isYmdInInclusiveRange(ymd: string, startYmd: string, endYmd: string): boolean {
  return ymd >= startYmd && ymd <= endYmd;
}

export function formatWeekReservationsTrend(
  currentCount: number,
  previousCount: number,
): Pick<WeekReservationsKpi, "trendLabel" | "trendTone"> {
  const suffix = " vs semaine dernière";
  if (currentCount === previousCount) {
    return { trendLabel: `+0%${suffix}`, trendTone: "muted" };
  }
  if (previousCount <= 0) {
    if (currentCount <= 0) {
      return { trendLabel: `—${suffix}`, trendTone: "muted" };
    }
    return { trendLabel: `+100%${suffix}`, trendTone: "success" };
  }
  const raw = ((currentCount - previousCount) / previousCount) * 100;
  const rounded = Math.round(raw);
  if (rounded > 0) {
    return { trendLabel: `+${rounded}%${suffix}`, trendTone: "success" };
  }
  if (rounded < 0) {
    return { trendLabel: `${rounded}%${suffix}`, trendTone: "warning" };
  }
  return { trendLabel: `+0%${suffix}`, trendTone: "muted" };
}

/** Réservations confirmées sur 7 jours à partir d’aujourd’hui (inclus), vs les 7 jours précédents. */
export function computeWeekReservationsKpi(
  reservations: ReservationRow[],
  todayYmd: string = calendarYmdInBusinessTz(),
): WeekReservationsKpi {
  const endYmd = addCalendarDaysYmd(todayYmd, 6);
  const previousStartYmd = addCalendarDaysYmd(todayYmd, -7);
  const previousEndYmd = addCalendarDaysYmd(todayYmd, -1);

  const confirmed = reservations.filter((r) => r.status === CONFIRMED_STATUS);
  const currentRows = confirmed.filter((r) =>
    isYmdInInclusiveRange(r.reservation_date, todayYmd, endYmd),
  );
  const previousCount = confirmed.filter((r) =>
    isYmdInInclusiveRange(r.reservation_date, previousStartYmd, previousEndYmd),
  ).length;

  const reservationCount = currentRows.length;
  const totalCovers = currentRows.reduce((sum, row) => sum + row.guests, 0);
  const trend = formatWeekReservationsTrend(reservationCount, previousCount);

  return {
    reservationCount,
    totalCovers,
    ...trend,
  };
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
