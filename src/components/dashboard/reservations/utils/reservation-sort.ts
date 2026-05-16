import { reservationStartInBusinessTz } from "@/src/lib/date/business-calendar";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";

export function reservationDateTimeValue(reservation: ReservationRow): number {
  const t = reservationStartInBusinessTz(
    reservation.reservation_date,
    reservation.reservation_time,
  ).getTime();
  return Number.isNaN(t) ? 0 : t;
}

export function sortReservations(values: ReservationRow[]): ReservationRow[] {
  return [...values].sort((a, b) => reservationDateTimeValue(a) - reservationDateTimeValue(b));
}
