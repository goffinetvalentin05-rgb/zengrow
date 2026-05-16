import type { CustomerKpis } from "@/src/components/dashboard/customers/utils/customer-kpis";

export type { CustomerKpis };

export type CustomerRecord = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  reservationCount: number;
  lastVisitAt: string | null;
  totalVisits: number;
  avgCovers: number | null;
};

export type CustomersPageProps = {
  customers: CustomerRecord[];
  kpis: CustomerKpis;
};

/** @deprecated Utiliser CustomerRecord */
export type CustomerRow = CustomerRecord;
