import { addDays } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";
import type {
  DayStatusFilter,
  DayZoneFilter,
  ReservationRow,
  SeatingZone,
} from "@/src/components/dashboard/reservations/types";
import { sortReservations } from "@/src/components/dashboard/reservations/utils/reservation-sort";
import { businessCalendarTimeZone, calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";

export function addCalendarDaysYmd(ymd: string, deltaDays: number): string {
  const tz = businessCalendarTimeZone();
  const base = toDate(`${ymd}T12:00:00`, { timeZone: tz });
  return formatInTimeZone(addDays(base, deltaDays), tz, "yyyy-MM-dd");
}

export function seatingZoneFromRow(row: ReservationRow): SeatingZone {
  return row.zone === "terrace" ? "terrace" : "interior";
}

export function filterDayReservations(
  reservations: ReservationRow[],
  daySectionDate: string,
  daySectionStatus: DayStatusFilter,
  showZoneUi: boolean,
  dayZoneFilter: DayZoneFilter,
): ReservationRow[] {
  let rows = reservations.filter((r) => r.reservation_date === daySectionDate);
  if (daySectionStatus === "confirmed") rows = rows.filter((r) => r.status === "confirmed");
  else if (daySectionStatus === "pending") rows = rows.filter((r) => r.status === "pending");
  else if (daySectionStatus === "cancelled") rows = rows.filter((r) => r.status === "cancelled");
  if (showZoneUi && dayZoneFilter === "interior") {
    rows = rows.filter((r) => seatingZoneFromRow(r) === "interior");
  } else if (showZoneUi && dayZoneFilter === "terrace") {
    rows = rows.filter((r) => seatingZoneFromRow(r) === "terrace");
  }
  return sortReservations(rows);
}

export function filterUpcomingReservations(
  reservations: ReservationRow[],
  upcomingRangeStart: string,
  upcomingRangeEnd: string,
): ReservationRow[] {
  const bizToday = calendarYmdInBusinessTz();
  const minFuture = addCalendarDaysYmd(bizToday, 1);
  let from = upcomingRangeStart;
  if (from < minFuture) from = minFuture;
  let to = upcomingRangeEnd;
  if (to < from) to = from;
  return sortReservations(
    reservations.filter((r) => r.reservation_date >= from && r.reservation_date <= to),
  );
}
