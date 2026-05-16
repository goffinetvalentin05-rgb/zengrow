"use client";

import { useMemo } from "react";
import ReservationCancelDialog from "@/src/components/dashboard/reservations/list-row/reservation-cancel-dialog";
import ReservationCardRow from "@/src/components/dashboard/reservations/list-row/reservation-card-row";
import { useReservationRowActions } from "@/src/components/dashboard/reservations/hooks/use-reservation-row-actions";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
import { formatYmdLongFr } from "@/src/components/dashboard/reservations/utils/reservation-date-format";
import { groupReservationsByDate } from "@/src/components/dashboard/reservations/utils/reservation-grouping";

type ReservationsUpcomingListProps = {
  rows: ReservationRow[];
};

export default function ReservationsUpcomingList({ rows }: ReservationsUpcomingListProps) {
  const { buildHandlers, cancelTarget, cancelSaving, closeCancelDialog, confirmCancel } =
    useReservationRowActions();

  const dateGroups = useMemo(() => groupReservationsByDate(rows), [rows]);

  return (
    <>
      <div className="space-y-6">
        {dateGroups.map((group) => (
          <section key={group.date} className="space-y-3">
            <header className="flex flex-wrap items-baseline justify-between gap-2 px-1">
              <h3 className="text-sm font-semibold text-zg-fg">{formatYmdLongFr(group.date)}</h3>
              <p className="text-xs text-zg-text-muted">
                {group.reservationCount} résa · {group.coverCount} couverts
              </p>
            </header>
            <div className="space-y-2">
              {group.rows.map((reservation) => (
                <ReservationCardRow
                  key={reservation.id}
                  reservation={reservation}
                  actionHandlers={buildHandlers(reservation)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
      <ReservationCancelDialog
        reservation={cancelTarget}
        saving={cancelSaving}
        onClose={closeCancelDialog}
        onConfirm={confirmCancel}
      />
    </>
  );
}
