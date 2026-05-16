import { describe, expect, it } from "vitest";
import {
  computeWeekReservationsKpi,
  formatWeekReservationsTrend,
} from "@/src/components/dashboard/reservations/utils/reservation-kpi";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";

function row(
  partial: Pick<ReservationRow, "id" | "reservation_date" | "guests" | "status">,
): ReservationRow {
  return {
    id: partial.id,
    reservation_date: partial.reservation_date,
    reservation_time: "12:00",
    guest_name: "Test",
    guest_phone: null,
    guest_email: null,
    guests: partial.guests,
    status: partial.status,
    internal_note: null,
    created_at: "2026-01-01T00:00:00Z",
  };
}

describe("formatWeekReservationsTrend", () => {
  it("affiche une hausse en vert", () => {
    expect(formatWeekReservationsTrend(10, 8)).toEqual({
      trendLabel: "+25% vs semaine dernière",
      trendTone: "success",
    });
  });

  it("affiche une baisse en orange", () => {
    expect(formatWeekReservationsTrend(4, 8)).toEqual({
      trendLabel: "-50% vs semaine dernière",
      trendTone: "warning",
    });
  });
});

describe("computeWeekReservationsKpi", () => {
  const today = "2026-05-16";
  const reservations: ReservationRow[] = [
    row({ id: "1", reservation_date: "2026-05-16", guests: 2, status: "confirmed" }),
    row({ id: "2", reservation_date: "2026-05-18", guests: 4, status: "confirmed" }),
    row({ id: "3", reservation_date: "2026-05-22", guests: 2, status: "confirmed" }),
    row({ id: "4", reservation_date: "2026-05-09", guests: 3, status: "confirmed" }),
    row({ id: "5", reservation_date: "2026-05-16", guests: 5, status: "pending" }),
    row({ id: "6", reservation_date: "2026-05-17", guests: 1, status: "cancelled" }),
  ];

  it("compte les confirmées sur 7 jours inclus et les couverts", () => {
    const kpi = computeWeekReservationsKpi(reservations, today);
    expect(kpi.reservationCount).toBe(3);
    expect(kpi.totalCovers).toBe(8);
  });

  it("compare aux 7 jours précédents", () => {
    const kpi = computeWeekReservationsKpi(reservations, today);
    expect(kpi.trendLabel).toBe("+200% vs semaine dernière");
    expect(kpi.trendTone).toBe("success");
  });
});
