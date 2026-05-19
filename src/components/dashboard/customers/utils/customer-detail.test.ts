import { describe, expect, it } from "vitest";
import { computeCustomerDetailStats } from "@/src/components/dashboard/customers/utils/customer-detail";
import type { CustomerReservationSummary } from "@/src/components/dashboard/customers/types";

const row = (
  overrides: Partial<CustomerReservationSummary> & Pick<CustomerReservationSummary, "reservation_date">,
): CustomerReservationSummary => ({
  id: "r1",
  reservation_time: "19:00:00",
  guests: 2,
  status: "completed",
  internal_note: null,
  source: "public_link",
  reservation_type: "standard",
  ...overrides,
});

describe("computeCustomerDetailStats", () => {
  it("calcule couverts et source de la première résa", () => {
    const stats = computeCustomerDetailStats([
      row({ id: "a", reservation_date: "2025-06-01", guests: 4, source: "manual_dashboard" }),
      row({ id: "b", reservation_date: "2024-01-15", guests: 2, source: "public_link" }),
    ]);
    expect(stats.totalCovers).toBe(6);
    expect(stats.acquisitionSource).toBe("Showroom");
  });
});
