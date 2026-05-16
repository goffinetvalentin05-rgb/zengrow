import type { ReservationRow, SeatingZone } from "@/src/components/dashboard/reservations/types";
import { reservationStartInBusinessTz } from "@/src/lib/date/business-calendar";
import { zoneDisplayLabel } from "@/src/lib/reservation/terrace-settings";

/** Affichage téléphone type 078 254 56 84 (CH 10 chiffres). */
export function formatGuestPhoneDisplay(phone: string | null | undefined): string | null {
  const trimmed = phone?.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
  }
  if (digits.length >= 9) {
    return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  }
  return trimmed;
}

export function buildReservationRowMetadata(
  reservation: ReservationRow,
  zone: SeatingZone,
  terraceLabel: string,
): string {
  const zoneLabel = zoneDisplayLabel(zone, terraceLabel);
  const phone = formatGuestPhoneDisplay(reservation.guest_phone);
  const specialNote = reservation.internal_note?.trim();

  if (phone) return `${zoneLabel} · ${phone}`;
  if (specialNote) return `${zoneLabel} · ${specialNote}`;
  return zoneLabel;
}

const ARRIVAL_WINDOW_BEFORE_MIN = 45;
const ARRIVAL_WINDOW_AFTER_MIN = 150;

/** Créneau proche : arrivée possible pour une résa confirmée. */
export function isArrivalWindowOpen(
  reservation: ReservationRow,
  ref: Date = new Date(),
): boolean {
  if (reservation.status !== "confirmed") return false;
  const start = reservationStartInBusinessTz(
    reservation.reservation_date,
    reservation.reservation_time,
  );
  const diffMin = (start.getTime() - ref.getTime()) / 60_000;
  return diffMin <= ARRIVAL_WINDOW_BEFORE_MIN && diffMin >= -ARRIVAL_WINDOW_AFTER_MIN;
}
