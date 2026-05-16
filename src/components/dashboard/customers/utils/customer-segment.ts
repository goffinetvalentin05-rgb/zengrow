import type { CustomerRecord } from "@/src/components/dashboard/customers/types";

export type CustomerSegment = "FIDELE" | "REGULIER" | "NOUVEAU" | "INACTIF";

const DAY_MS = 24 * 60 * 60 * 1000;
const INACTIVE_MS = 180 * DAY_MS;

function lastVisitAgeMs(lastVisitAt: string | null, nowMs: number): number | null {
  if (!lastVisitAt) return null;
  const t = new Date(lastVisitAt).getTime();
  if (Number.isNaN(t)) return null;
  return nowMs - t;
}

export function getCustomerSegment(customer: CustomerRecord, now: Date = new Date()): CustomerSegment {
  const age = lastVisitAgeMs(customer.lastVisitAt, now.getTime());
  if (customer.totalVisits > 0 && age != null && age >= INACTIVE_MS) {
    return "INACTIF";
  }
  if (customer.totalVisits >= 5) return "FIDELE";
  if (customer.totalVisits >= 2) return "REGULIER";
  return "NOUVEAU";
}

export const CUSTOMER_SEGMENT_LABEL: Record<CustomerSegment, string> = {
  FIDELE: "FIDÈLE",
  REGULIER: "RÉGULIER",
  NOUVEAU: "NOUVEAU",
  INACTIF: "INACTIF",
};

export const CUSTOMER_SEGMENT_BADGE_CLASS: Record<CustomerSegment, string> = {
  FIDELE: "bg-zg-accent-soft-bg text-zg-accent",
  REGULIER: "bg-zg-info-soft-bg text-zg-info",
  NOUVEAU: "bg-zg-success-soft-bg text-zg-success",
  INACTIF: "bg-zg-surface-elevated text-zg-text-muted",
};
