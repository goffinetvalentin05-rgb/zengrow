import { describe, expect, it } from "vitest";
import { getCustomerSegment } from "@/src/components/dashboard/customers/utils/customer-segment";
import type { CustomerRecord } from "@/src/components/dashboard/customers/types";

const base: CustomerRecord = {
  id: "1",
  name: "Test",
  phone: null,
  email: null,
  reservationCount: 0,
  lastVisitAt: null,
  firstVisitAt: null,
  totalVisits: 0,
  avgCovers: null,
};

describe("getCustomerSegment", () => {
  const now = new Date("2026-05-16T12:00:00.000Z");

  it("priorise inactif > 6 mois", () => {
    expect(
      getCustomerSegment(
        { ...base, totalVisits: 10, lastVisitAt: "2025-01-01T00:00:00.000Z" },
        now,
      ),
    ).toBe("INACTIF");
  });

  it("marque fidèle à 5+ visites", () => {
    expect(
      getCustomerSegment(
        { ...base, totalVisits: 5, lastVisitAt: "2026-04-01T00:00:00.000Z" },
        now,
      ),
    ).toBe("FIDELE");
  });

  it("marque régulier à 2–4 visites", () => {
    expect(
      getCustomerSegment(
        { ...base, totalVisits: 3, lastVisitAt: "2026-04-01T00:00:00.000Z" },
        now,
      ),
    ).toBe("REGULIER");
  });

  it("marque nouveau à 1 visite", () => {
    expect(
      getCustomerSegment(
        { ...base, totalVisits: 1, lastVisitAt: "2026-04-01T00:00:00.000Z" },
        now,
      ),
    ).toBe("NOUVEAU");
  });
});
