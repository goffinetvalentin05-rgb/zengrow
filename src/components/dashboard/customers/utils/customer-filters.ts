import type { CustomerRecord } from "@/src/components/dashboard/customers/types";

export type VisitRangeFilter = "all" | "1" | "2-5" | "5-10" | "10+";
export type ActivityStatusFilter = "all" | "active_3m" | "inactive_3m" | "inactive_6m";
export type AvgCoversRangeFilter = "all" | "1-2" | "3-4" | "5-6" | "7+";

export type CustomerFilters = {
  query: string;
  visitRange: VisitRangeFilter;
  activityStatus: ActivityStatusFilter;
  avgCoversRange: AvgCoversRangeFilter;
  firstVisitFrom: string | null;
  firstVisitTo: string | null;
};

export type FilterPillKey =
  | "query"
  | "visitRange"
  | "activityStatus"
  | "avgCoversRange"
  | "firstVisitRange";

export type CustomerFilterPill = {
  key: FilterPillKey;
  label: string;
};

export const DEFAULT_CUSTOMER_FILTERS: CustomerFilters = {
  query: "",
  visitRange: "all",
  activityStatus: "all",
  avgCoversRange: "all",
  firstVisitFrom: null,
  firstVisitTo: null,
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeYmd(value: string | null | undefined): string | null {
  if (value == null) return null;
  const t = value.trim();
  if (t.length >= 10 && t[4] === "-" && t[7] === "-") return t.slice(0, 10);
  return null;
}

function matchesVisitRange(totalVisits: number, filter: VisitRangeFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "1":
      return totalVisits === 1;
    case "2-5":
      return totalVisits >= 2 && totalVisits <= 5;
    case "5-10":
      return totalVisits >= 5 && totalVisits <= 10;
    case "10+":
      return totalVisits >= 10;
    default:
      return true;
  }
}

function lastVisitAgeMs(lastVisitAt: string | null, nowMs: number): number | null {
  if (!lastVisitAt) return null;
  const t = new Date(lastVisitAt).getTime();
  if (Number.isNaN(t)) return null;
  return nowMs - t;
}

function matchesActivityStatus(
  customer: CustomerRecord,
  filter: ActivityStatusFilter,
  nowMs: number,
): boolean {
  if (filter === "all") return true;
  if (customer.totalVisits === 0) return false;

  const age = lastVisitAgeMs(customer.lastVisitAt, nowMs);
  if (age == null) return filter.startsWith("inactive");

  if (filter === "active_3m") return age < 90 * DAY_MS;
  if (filter === "inactive_3m") return age >= 90 * DAY_MS;
  if (filter === "inactive_6m") return age >= 180 * DAY_MS;
  return true;
}

function matchesAvgCoversRange(avg: number | null, filter: AvgCoversRangeFilter): boolean {
  if (filter === "all") return true;
  if (avg == null) return false;
  switch (filter) {
    case "1-2":
      return avg >= 1 && avg <= 2;
    case "3-4":
      return avg >= 3 && avg <= 4;
    case "5-6":
      return avg >= 5 && avg <= 6;
    case "7+":
      return avg >= 7;
    default:
      return true;
  }
}

function matchesFirstVisitRange(
  firstVisitAt: string | null,
  from: string | null,
  to: string | null,
): boolean {
  if (!from && !to) return true;
  const ymd = normalizeYmd(firstVisitAt);
  if (!ymd) return false;
  if (from && ymd < from) return false;
  if (to && ymd > to) return false;
  return true;
}

function matchesQuery(customer: CustomerRecord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = `${customer.name} ${customer.email ?? ""} ${customer.phone ?? ""}`.toLowerCase();
  return hay.includes(q);
}

export function filterCustomers(
  customers: readonly CustomerRecord[],
  filters: CustomerFilters,
  now: Date = new Date(),
): CustomerRecord[] {
  const nowMs = now.getTime();
  return customers.filter((customer) => {
    if (!matchesQuery(customer, filters.query)) return false;
    if (!matchesVisitRange(customer.totalVisits, filters.visitRange)) return false;
    if (!matchesActivityStatus(customer, filters.activityStatus, nowMs)) return false;
    if (!matchesAvgCoversRange(customer.avgCovers, filters.avgCoversRange)) return false;
    if (
      !matchesFirstVisitRange(
        customer.firstVisitAt,
        filters.firstVisitFrom,
        filters.firstVisitTo,
      )
    ) {
      return false;
    }
    return true;
  });
}

export function countActiveFilters(filters: CustomerFilters): number {
  let n = 0;
  if (filters.query.trim()) n += 1;
  if (filters.visitRange !== "all") n += 1;
  if (filters.activityStatus !== "all") n += 1;
  if (filters.avgCoversRange !== "all") n += 1;
  if (filters.firstVisitFrom || filters.firstVisitTo) n += 1;
  return n;
}

function formatYmdFr(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  if (!y || !m || !d) return ymd;
  return `${d}.${m}.${y}`;
}

const VISIT_RANGE_LABELS: Record<Exclude<VisitRangeFilter, "all">, string> = {
  "1": "1 visite",
  "2-5": "2–5 visites",
  "5-10": "5–10 visites",
  "10+": "10+ visites",
};

const ACTIVITY_LABELS: Record<Exclude<ActivityStatusFilter, "all">, string> = {
  active_3m: "Actif < 3 mois",
  inactive_3m: "Inactif > 3 mois",
  inactive_6m: "Inactif > 6 mois",
};

const AVG_COVERS_LABELS: Record<Exclude<AvgCoversRangeFilter, "all">, string> = {
  "1-2": "1–2 couverts",
  "3-4": "3–4 couverts",
  "5-6": "5–6 couverts",
  "7+": "7+ couverts",
};

export function buildFilterPills(filters: CustomerFilters): CustomerFilterPill[] {
  const pills: CustomerFilterPill[] = [];
  const q = filters.query.trim();
  if (q) {
    pills.push({ key: "query", label: `Recherche : ${q}` });
  }
  if (filters.visitRange !== "all") {
    pills.push({
      key: "visitRange",
      label: VISIT_RANGE_LABELS[filters.visitRange],
    });
  }
  if (filters.activityStatus !== "all") {
    pills.push({
      key: "activityStatus",
      label: ACTIVITY_LABELS[filters.activityStatus],
    });
  }
  if (filters.avgCoversRange !== "all") {
    pills.push({
      key: "avgCoversRange",
      label: AVG_COVERS_LABELS[filters.avgCoversRange],
    });
  }
  if (filters.firstVisitFrom || filters.firstVisitTo) {
    const from = filters.firstVisitFrom ? formatYmdFr(filters.firstVisitFrom) : "…";
    const to = filters.firstVisitTo ? formatYmdFr(filters.firstVisitTo) : "…";
    pills.push({
      key: "firstVisitRange",
      label: `1ère visite : ${from} – ${to}`,
    });
  }
  return pills;
}

export function clearFilterKey(
  filters: CustomerFilters,
  key: FilterPillKey,
): CustomerFilters {
  switch (key) {
    case "query":
      return { ...filters, query: "" };
    case "visitRange":
      return { ...filters, visitRange: "all" };
    case "activityStatus":
      return { ...filters, activityStatus: "all" };
    case "avgCoversRange":
      return { ...filters, avgCoversRange: "all" };
    case "firstVisitRange":
      return { ...filters, firstVisitFrom: null, firstVisitTo: null };
    default:
      return filters;
  }
}
