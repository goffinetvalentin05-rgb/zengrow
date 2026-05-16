import type { ReservationRow } from "@/src/components/dashboard/reservations/types";

/** Évite d’afficher deux fois les résas du jour déjà listé en haut de page. */
export function excludeDayFromUpcomingRows(
  rows: ReservationRow[],
  daySectionDate: string,
): ReservationRow[] {
  return rows.filter((row) => row.reservation_date !== daySectionDate);
}
