import { describe, expect, it } from "vitest";
import {
  computeCustomerKpis,
  formatNewThisMonthSubline,
  newCustomersMonthTrend,
} from "@/src/components/dashboard/customers/utils/customer-kpis";
import type { CustomerRecord } from "@/src/components/dashboard/customers/types";

const baseCustomer = (overrides: Partial<CustomerRecord>): CustomerRecord => ({
  id: "1",
  name: "Test",
  phone: null,
  email: null,
  reservationCount: 2,
  lastVisitAt: null,
  firstVisitAt: null,
  totalVisits: 2,
  avgCovers: null,
  internalNote: null,
  ...overrides,
});

describe("newCustomersMonthTrend", () => {
  it("indique une hausse avec flèche", () => {
    expect(newCustomersMonthTrend(5, 3)).toEqual({
      label: "↑ +2 vs mois dernier",
      tone: "success",
    });
  });

  it("indique une baisse avec flèche", () => {
    expect(newCustomersMonthTrend(2, 5)).toEqual({
      label: "↓ -3 vs mois dernier",
      tone: "warning",
    });
  });
});

describe("computeCustomerKpis", () => {
  it("calcule fidèles et moyennes", () => {
    const customers = [
      baseCustomer({ id: "a", totalVisits: 4, reservationCount: 4 }),
      baseCustomer({ id: "b", totalVisits: 1, reservationCount: 1 }),
      baseCustomer({ id: "c", totalVisits: 3, reservationCount: 2 }),
    ];
    const kpis = computeCustomerKpis(customers, 2, 1);
    expect(kpis.totalClients).toBe(3);
    expect(kpis.loyalClients).toBe(2);
    expect(kpis.loyalPercent).toBe(67);
    expect(kpis.totalReservations).toBe(7);
    expect(kpis.avgVisitsPerClient).toBe(2.3);
    expect(formatNewThisMonthSubline(kpis.newThisMonth)).toBe("2 nouveaux ce mois");
  });
});
