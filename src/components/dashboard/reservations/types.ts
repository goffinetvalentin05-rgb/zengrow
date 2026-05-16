import type { OpeningHours } from "@/src/lib/utils";

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "refused"
  | "cancelled"
  | "completed"
  | "no-show";

export type ReservationRow = {
  id: string;
  reservation_date: string;
  reservation_time: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  guests: number;
  status: ReservationStatus;
  internal_note: string | null;
  created_at: string;
  source?: string | null;
  customer_id?: string | null;
  zone?: "interior" | "terrace" | string | null;
  reservation_type?: "standard" | "walkin";
};

export type SeatingZone = "interior" | "terrace";

export type DayStatusFilter = "all" | "confirmed" | "pending" | "cancelled";

export type DayZoneFilter = "all" | "interior" | "terrace";

export type ReservationViewMode = "list" | "timeline";

export type ReservationsPageProps = {
  initialReservations: ReservationRow[];
  initialShowManualForm?: boolean;
  terraceEnabled?: boolean;
  /** Afficher badges / filtre zone (terrasse configurée). */
  showZoneUi?: boolean;
  terraceLabel?: string;
  autoArchiveReservations?: boolean;
  reservationDurationMinutes?: number;
  restaurantCapacity?: number;
  openingHours?: OpeningHours | null;
};

/** @deprecated Utiliser ReservationsPageProps */
export type ReservationsManagerProps = ReservationsPageProps;
