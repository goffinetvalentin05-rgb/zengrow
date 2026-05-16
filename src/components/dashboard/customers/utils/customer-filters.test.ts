import { describe, expect, it } from "vitest";
import {
  buildFilterPills,
  clearFilterKey,
  countActiveFilters,
  DEFAULT_CUSTOMER_FILTERS,
  filterCustomers,
} from "@/src/components/dashboard/customers/utils/customer-filters";
import type { CustomerRecord } from "@/src/components/dashboard/customers/types";

const customer = (overrides: Partial<CustomerRecord>): CustomerRecord => ({
  id: "1",
  name: "Valentin Goffinet",
  phone: "0788739065",
  email: "valentin@example.com",
  reservationCount: 3,
  lastVisitAt: "2026-01-15T12:00:00.000Z",
  firstVisitAt: "2024-06-01",
  totalVisits: 4,
  avgCovers: 3.5,
  internalNote: null,
  ...overrides,
});

describe("filterCustomers", () => {
  const now = new Date("2026-05-16T12:00:00.000Z");
  const rows = [
    customer({ id: "a" }),
    customer({
      id: "b",
      name: "Marie Dupont",
      totalVisits: 1,
      avgCovers: 2,
      firstVisitAt: "2025-03-01",
    }),
  ];

  it("filtre par recherche", () => {
    const out = filterCustomers(rows, { ...DEFAULT_CUSTOMER_FILTERS, query: "marie" }, now);
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe("b");
  });

  it("filtre par plage de visites", () => {
    const out = filterCustomers(rows, { ...DEFAULT_CUSTOMER_FILTERS, visitRange: "2-5" }, now);
    expect(out.map((c) => c.id)).toEqual(["a"]);
  });

  it("filtre par première visite", () => {
    const out = filterCustomers(
      rows,
      {
        ...DEFAULT_CUSTOMER_FILTERS,
        firstVisitFrom: "2024-01-01",
        firstVisitTo: "2024-12-31",
      },
      now,
    );
    expect(out).toHaveLength(1);
    expect(out[0]?.id).toBe("a");
  });
});

describe("buildFilterPills", () => {
  it("compte les filtres actifs", () => {
    const filters = {
      ...DEFAULT_CUSTOMER_FILTERS,
      query: "val",
      visitRange: "10+" as const,
    };
    expect(countActiveFilters(filters)).toBe(2);
    expect(buildFilterPills(filters)).toHaveLength(2);
    expect(clearFilterKey(filters, "query").query).toBe("");
  });
});
