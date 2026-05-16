import type { CustomerKpis } from "@/src/components/dashboard/customers/utils/customer-kpis";

export type { CustomerKpis };

import type { ReservationStatus } from "@/src/components/dashboard/reservations/types";

export type CustomerReservationSummary = {
  id: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  status: ReservationStatus;
  internal_note: string | null;
  source: string | null;
  reservation_type: "standard" | "walkin" | null;
};

export type CustomerDetailStats = {
  totalCovers: number;
  acquisitionSource: string | null;
};

export type CustomerRecord = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  reservationCount: number;
  lastVisitAt: string | null;
  /** YYYY-MM-DD — première réservation ou date de création. */
  firstVisitAt: string | null;
  totalVisits: number;
  avgCovers: number | null;
  internalNote: string | null;
};

export type CustomersPageProps = {
  customers: CustomerRecord[];
  kpis: CustomerKpis;
};

/** @deprecated Utiliser CustomerRecord */
export type CustomerRow = CustomerRecord;
