import { describe, expect, it } from "vitest";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
import {
  buildListServiceSections,
  groupReservationsByDate,
  serviceGroupStats,
} from "@/src/components/dashboard/reservations/utils/reservation-grouping";
import { excludeDayFromUpcomingRows } from "@/src/components/dashboard/reservations/utils/reservation-list-filters";
import { filterUpcomingReservations } from "@/src/components/dashboard/reservations/utils/reservation-filters";
import { addCalendarDaysYmd } from "@/src/components/dashboard/reservations/utils/reservation-filters";

function row(
  partial: Partial<ReservationRow> & Pick<ReservationRow, "id" | "reservation_date" | "reservation_time">,
): ReservationRow {
  return {
    id: partial.id,
    reservation_date: partial.reservation_date,
    reservation_time: partial.reservation_time,
    guest_name: partial.guest_name ?? "Client",
    guest_phone: partial.guest_phone ?? null,
    guest_email: partial.guest_email ?? null,
    guests: partial.guests ?? 2,
    status: partial.status ?? "confirmed",
    internal_note: null,
    created_at: "2026-01-01T00:00:00Z",
    source: partial.source ?? "public_link",
    customer_id: partial.customer_id ?? null,
  };
}

describe("buildListServiceSections", () => {
  it("expose toujours midi et soir", () => {
    const sections = buildListServiceSections(
      [row({ id: "1", reservation_date: "2026-05-16", reservation_time: "19:00" })],
      "2026-05-16",
      null,
    );
    expect(sections.map((s) => s.key)).toEqual(["lunch", "dinner"]);
    expect(sections.find((s) => s.key === "dinner")?.reservationCount).toBe(1);
  });
});

describe("groupReservationsByDate", () => {
  it("trie par date croissante", () => {
    const groups = groupReservationsByDate([
      row({ id: "2", reservation_date: "2026-05-18", reservation_time: "12:00" }),
      row({ id: "1", reservation_date: "2026-05-17", reservation_time: "12:00" }),
    ]);
    expect(groups.map((g) => g.date)).toEqual(["2026-05-17", "2026-05-18"]);
    expect(serviceGroupStats(groups[0]!.rows).coverCount).toBe(2);
  });
});

describe("excludeDayFromUpcomingRows", () => {
  it("retire le jour affiché en haut de page", () => {
    const rows = [
      row({ id: "1", reservation_date: "2026-05-17", reservation_time: "12:00" }),
      row({ id: "2", reservation_date: "2026-05-18", reservation_time: "12:00" }),
    ];
    expect(excludeDayFromUpcomingRows(rows, "2026-05-17").map((r) => r.id)).toEqual(["2"]);
  });
});

describe("performance liste (50+ réservations)", () => {
  it("groupe 120 réservations en moins de 50 ms", () => {
    const ymd = "2026-05-16";
    const many = Array.from({ length: 120 }, (_, index) => {
      const futureDay = addCalendarDaysYmd(ymd, 1 + (index % 8));
      return row({
        id: `r-${index}`,
        reservation_date: index < 60 ? ymd : futureDay,
        reservation_time: index % 2 === 0 ? "12:30" : "19:30",
        guests: 2 + (index % 4),
      });
    });

    const start = performance.now();
    const todayRows = many.filter((r) => r.reservation_date === ymd);
    const sections = buildListServiceSections(todayRows, ymd, null);
    const grouped = groupReservationsByDate(
      excludeDayFromUpcomingRows(
        filterUpcomingReservations(many, addCalendarDaysYmd(ymd, 1), addCalendarDaysYmd(ymd, 30)),
        ymd,
      ),
    );
    const elapsed = performance.now() - start;

    expect(sections).toHaveLength(2);
    expect(grouped.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(50);
  });
});
