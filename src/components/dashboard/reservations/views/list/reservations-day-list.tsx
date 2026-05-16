"use client";

import { useMemo } from "react";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import { useReservationRowActions } from "@/src/components/dashboard/reservations/hooks/use-reservation-row-actions";
import ReservationCancelDialog from "@/src/components/dashboard/reservations/list-row/reservation-cancel-dialog";
import ReservationCardRow from "@/src/components/dashboard/reservations/list-row/reservation-card-row";
import ReservationsServiceGroup from "@/src/components/dashboard/reservations/views/list/reservations-service-group";
import { groupReservationsByService } from "@/src/components/dashboard/reservations/utils/reservation-grouping";

import type { ReservationRow } from "@/src/components/dashboard/reservations/types";

type ReservationsDayListProps = {
  rows: ReservationRow[];
};

export default function ReservationsDayList({ rows }: ReservationsDayListProps) {
  const { daySectionDate, openingHours } = useReservations();
  const { buildHandlers, cancelTarget, cancelSaving, closeCancelDialog, confirmCancel } =
    useReservationRowActions();

  const serviceGroups = useMemo(
    () => groupReservationsByService(rows, daySectionDate, openingHours),
    [rows, daySectionDate, openingHours],
  );

  return (
    <>
      <div className="space-y-4">
        {serviceGroups.map((group) => (
          <ReservationsServiceGroup key={group.key} group={group}>
            {group.rows.map((reservation) => (
              <ReservationCardRow
                key={reservation.id}
                reservation={reservation}
                actionHandlers={buildHandlers(reservation)}
              />
            ))}
          </ReservationsServiceGroup>
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
