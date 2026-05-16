import { formatReservationSourceLabel } from "@/src/components/dashboard/reservations/utils/reservation-detail";
import type {
  CustomerDetailStats,
  CustomerReservationSummary,
} from "@/src/components/dashboard/customers/types";

const COVERS_STATUSES = new Set(["pending", "confirmed", "completed", "no-show"]);

export function computeCustomerDetailStats(
  reservations: readonly CustomerReservationSummary[],
): CustomerDetailStats {
  let totalCovers = 0;
  let earliest: CustomerReservationSummary | null = null;

  for (const row of reservations) {
    if (row.reservation_type === "walkin") continue;
    if (COVERS_STATUSES.has(row.status)) {
      totalCovers += row.guests ?? 0;
    }
    if (!earliest) {
      earliest = row;
      continue;
    }
    const ymd = row.reservation_date.slice(0, 10);
    const cur = earliest.reservation_date.slice(0, 10);
    if (ymd < cur) earliest = row;
  }

  const acquisitionSource = earliest
    ? formatReservationSourceLabel(earliest.source, earliest.reservation_type ?? undefined)
    : null;

  return { totalCovers, acquisitionSource };
}
