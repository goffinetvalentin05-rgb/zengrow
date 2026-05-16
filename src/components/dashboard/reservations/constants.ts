import type { DayStatusFilter, ReservationRow, ReservationStatus } from "@/src/components/dashboard/reservations/types";

export const RESERVATIONS_VIEW_STORAGE_KEY = "zengrow.reservations.viewMode";

export const EDITABLE_STATUSES: readonly ReservationStatus[] = [
  "pending",
  "confirmed",
  "refused",
  "completed",
  "cancelled",
  "no-show",
];

export const STATUSES_WITHOUT_COMPLETED: readonly ReservationStatus[] = [
  "pending",
  "confirmed",
  "refused",
  "cancelled",
  "no-show",
];

export const STATUS_LABEL_FR: Record<ReservationStatus, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  refused: "Refusée",
  cancelled: "Annulée",
  completed: "Terminée",
  "no-show": "Absent",
};

export const DAY_STATUS_OPTIONS: { value: DayStatusFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "confirmed", label: "Confirmé" },
  { value: "pending", label: "En attente" },
  { value: "cancelled", label: "Annulé" },
];

export const RESERVATION_SELECT_COLUMNS =
  "id, reservation_date, reservation_time, guest_name, guest_phone, guest_email, guests, status, internal_note, created_at, source, customer_id, zone, reservation_type" as const;

export function historyStatusDisplayLabel(
  reservation: ReservationRow,
  autoArchive: boolean,
): string | undefined {
  if (autoArchive && reservation.status === "completed") return "Archivée";
  return undefined;
}
