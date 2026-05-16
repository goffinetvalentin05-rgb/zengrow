import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
import { formatNotificationRelativeTime } from "@/src/lib/notifications/relative-time";
import { formatInTimeZone, toDate } from "date-fns-tz";
import { fr } from "date-fns/locale";
import { businessCalendarTimeZone } from "@/src/lib/date/business-calendar";

const VISIT_STATUSES = new Set(["pending", "confirmed", "completed"]);

function normalizePhoneDigits(phone: string | null | undefined): string {
  return (phone ?? "").replace(/\D/g, "");
}

function guestMatchKey(reservation: ReservationRow): string {
  if (reservation.customer_id) {
    return `customer:${reservation.customer_id}`;
  }
  const phone = normalizePhoneDigits(reservation.guest_phone);
  if (phone.length >= 6) return `phone:${phone}`;
  const email = reservation.guest_email?.trim().toLowerCase();
  if (email) return `email:${email}`;
  return `name:${reservation.guest_name.trim().toLowerCase()}`;
}

export function isPublicReservationSource(source: string | null | undefined): boolean {
  const value = (source ?? "public_link").trim();
  return value === "public_link" || value === "public";
}

export function formatReservationSourceLabel(
  source: string | null | undefined,
  reservationType?: ReservationRow["reservation_type"],
): string {
  if (reservationType === "walkin") return "Walk-in";
  const value = (source ?? "public_link").trim();
  if (value === "manual_dashboard") return "Saisie manuelle";
  if (value === "public_link" || value === "public") return "Page publique";
  return value.replace(/_/g, " ");
}

export function formatReservationSourceLine(
  source: string | null | undefined,
  createdAtIso: string,
  reservationType?: ReservationRow["reservation_type"],
): string {
  const label = formatReservationSourceLabel(source, reservationType);
  const relative = formatNotificationRelativeTime(createdAtIso);
  return relative ? `${label} · ${relative}` : label;
}

export function formatShortDateFr(ymd: string): string {
  const tz = businessCalendarTimeZone();
  return formatInTimeZone(toDate(`${ymd}T12:00:00`, { timeZone: tz }), tz, "dd/MM/yyyy", {
    locale: fr,
  });
}

export function formatVisitOrdinalFr(count: number): string {
  if (count <= 1) return "1re visite";
  return `${count}e visite`;
}

export type GuestVisitStats = {
  visitCount: number;
  lastVisitYmd: string | null;
  showHistory: boolean;
};

export function computeGuestVisitStats(
  reservations: ReservationRow[],
  target: ReservationRow,
): GuestVisitStats {
  const key = guestMatchKey(target);
  const related = reservations.filter((row) => {
    if (row.reservation_type === "walkin") return false;
    if (!VISIT_STATUSES.has(row.status)) return false;
    return guestMatchKey(row) === key;
  });

  const visitCount = related.length;
  const previous = related
    .filter((row) => row.id !== target.id)
    .sort((a, b) => b.reservation_date.localeCompare(a.reservation_date));

  return {
    visitCount,
    lastVisitYmd: previous[0]?.reservation_date ?? null,
    showHistory: visitCount > 1,
  };
}

export function formatReservationPublicId(id: string): string {
  return id.replace(/-/g, "").slice(0, 8).toUpperCase();
}
