import { describe, expect, it } from "vitest";
import {
  computeGuestVisitStats,
  formatReservationSourceLabel,
  isPublicReservationSource,
} from "@/src/components/dashboard/reservations/utils/reservation-detail";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";

function row(
  partial: Partial<ReservationRow> & Pick<ReservationRow, "id" | "reservation_date" | "guest_phone">,
): ReservationRow {
  return {
    id: partial.id,
    reservation_date: partial.reservation_date,
    reservation_time: "19:00",
    guest_name: "Marie",
    guest_phone: partial.guest_phone,
    guest_email: partial.guest_email ?? null,
    guests: 2,
    status: partial.status ?? "confirmed",
    internal_note: null,
    created_at: "2026-01-01T00:00:00Z",
    source: partial.source ?? "public_link",
    customer_id: partial.customer_id ?? null,
  };
}

describe("reservation-detail utils", () => {
  it("détecte la source publique", () => {
    expect(isPublicReservationSource("public_link")).toBe(true);
    expect(isPublicReservationSource("manual_dashboard")).toBe(false);
  });

  it("formate les libellés source", () => {
    expect(formatReservationSourceLabel("manual_dashboard")).toBe("Saisie manuelle");
    expect(formatReservationSourceLabel("public_link")).toBe("Showroom");
  });

  it("calcule l'historique client", () => {
    const target = row({ id: "3", reservation_date: "2026-05-16", guest_phone: "0781112233" });
    const stats = computeGuestVisitStats(
      [
        row({ id: "1", reservation_date: "2026-04-01", guest_phone: "0781112233" }),
        row({ id: "2", reservation_date: "2026-05-01", guest_phone: "0781112233" }),
        target,
      ],
      target,
    );
    expect(stats.visitCount).toBe(3);
    expect(stats.showHistory).toBe(true);
    expect(stats.lastVisitYmd).toBe("2026-05-01");
  });
});
