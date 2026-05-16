import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
import { reservationTimePeriod } from "@/src/components/dashboard/reservations/utils/reservation-kpi";
import type { OpeningHours } from "@/src/lib/utils";

export type ServiceGroupKey = "lunch" | "dinner" | "other";

export type ServiceGroup = {
  key: ServiceGroupKey;
  label: string;
  rows: ReservationRow[];
  reservationCount: number;
  coverCount: number;
};

export function serviceGroupStats(rows: ReservationRow[]): {
  reservationCount: number;
  coverCount: number;
} {
  return {
    reservationCount: rows.length,
    coverCount: rows.reduce((sum, row) => sum + row.guests, 0),
  };
}

export function groupReservationsByService(
  rows: ReservationRow[],
  ymd: string,
  openingHours: OpeningHours | null | undefined,
): ServiceGroup[] {
  const lunchRows: ReservationRow[] = [];
  const dinnerRows: ReservationRow[] = [];
  const otherRows: ReservationRow[] = [];

  for (const row of rows) {
    const period = reservationTimePeriod(ymd, row.reservation_time, openingHours);
    if (period === "lunch") lunchRows.push(row);
    else if (period === "dinner") dinnerRows.push(row);
    else otherRows.push(row);
  }

  if (otherRows.length > 0) {
    if (lunchRows.length > 0 && dinnerRows.length === 0) {
      lunchRows.push(...otherRows);
    } else {
      dinnerRows.push(...otherRows);
    }
  }

  const groups: ServiceGroup[] = [];
  if (lunchRows.length > 0) {
    const stats = serviceGroupStats(lunchRows);
    groups.push({
      key: "lunch",
      label: "Midi",
      rows: lunchRows,
      ...stats,
    });
  }
  if (dinnerRows.length > 0) {
    const stats = serviceGroupStats(dinnerRows);
    groups.push({
      key: "dinner",
      label: "Soir",
      rows: dinnerRows,
      ...stats,
    });
  }
  return groups;
}

/** Sections Midi / Soir toujours présentes pour la vue liste (y compris vides). */
export function buildListServiceSections(
  rows: ReservationRow[],
  ymd: string,
  openingHours: OpeningHours | null | undefined,
): ServiceGroup[] {
  const lunchRows: ReservationRow[] = [];
  const dinnerRows: ReservationRow[] = [];
  const otherRows: ReservationRow[] = [];

  for (const row of rows) {
    const period = reservationTimePeriod(ymd, row.reservation_time, openingHours);
    if (period === "lunch") lunchRows.push(row);
    else if (period === "dinner") dinnerRows.push(row);
    else otherRows.push(row);
  }

  if (otherRows.length > 0) {
    if (lunchRows.length > 0 && dinnerRows.length === 0) {
      lunchRows.push(...otherRows);
    } else {
      dinnerRows.push(...otherRows);
    }
  }

  return (["lunch", "dinner"] as const).map((key) => {
    const sectionRows = key === "lunch" ? lunchRows : dinnerRows;
    return {
      key,
      label: key === "lunch" ? "Service midi" : "Service soir",
      rows: sectionRows,
      ...serviceGroupStats(sectionRows),
    };
  });
}

export function groupReservationsByDate(
  rows: ReservationRow[],
): { date: string; rows: ReservationRow[]; reservationCount: number; coverCount: number }[] {
  const byDate = new Map<string, ReservationRow[]>();
  for (const row of rows) {
    const list = byDate.get(row.reservation_date) ?? [];
    list.push(row);
    byDate.set(row.reservation_date, list);
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dateRows]) => ({
      date,
      rows: dateRows,
      ...serviceGroupStats(dateRows),
    }));
}
