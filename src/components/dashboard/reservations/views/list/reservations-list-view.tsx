"use client";

import { useCallback, useMemo } from "react";
import ReservationCancelDialog from "@/src/components/dashboard/reservations/list-row/reservation-cancel-dialog";
import type { ReservationListRowActionHandlers } from "@/src/components/dashboard/reservations/list-row/reservation-list-row-actions";
import ReservationDetailModal from "@/src/components/dashboard/reservations/detail/reservation-detail-modal";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import { useReservationRowActions } from "@/src/components/dashboard/reservations/hooks/use-reservation-row-actions";
import ReservationListServiceSection from "@/src/components/dashboard/reservations/views/list/reservation-list-service-section";
import ReservationsListDayEmpty from "@/src/components/dashboard/reservations/views/list/reservations-list-day-empty";
import { buildListServiceSections } from "@/src/components/dashboard/reservations/utils/reservation-grouping";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";

export default function ReservationsListView() {
  const {
    todayRows,
    daySectionDate,
    openingHours,
    isDayFilterToday: isViewingToday,
    zoneLabelTerrace,
    seatingZoneFromRow,
    savingId,
    setShowManualForm,
    setSelectedReservationId,
  } = useReservations();

  const { buildHandlers, cancelTarget, cancelSaving, closeCancelDialog, confirmCancel } =
    useReservationRowActions();

  const sections = useMemo(
    () => buildListServiceSections(todayRows, daySectionDate, openingHours),
    [todayRows, daySectionDate, openingHours],
  );

  const openDetail = useCallback(
    (reservation: ReservationRow) => {
      setSelectedReservationId(reservation.id);
    },
    [setSelectedReservationId],
  );

  const openManualForm = useCallback(() => {
    setShowManualForm(true);
  }, [setShowManualForm]);

  const mapHandlers = useCallback(
    (reservation: ReservationRow): ReservationListRowActionHandlers => {
      const base = buildHandlers(reservation);
      return {
        onArrived: base.onArrived,
        onCancel: base.onCancel,
        onCall: base.onCall,
        onEdit: () => openDetail(reservation),
      };
    },
    [buildHandlers, openDetail],
  );

  if (todayRows.length === 0) {
    return (
      <>
        <ReservationsListDayEmpty isToday={isViewingToday} onAddReservation={openManualForm} />
        <ReservationDetailModal />
        <ReservationCancelDialog
          reservation={cancelTarget}
          saving={cancelSaving}
          onClose={closeCancelDialog}
          onConfirm={confirmCancel}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {sections.map((section) => (
          <ReservationListServiceSection
            key={section.key}
            section={section}
            terraceLabel={zoneLabelTerrace}
            seatingZoneFromRow={seatingZoneFromRow}
            savingId={savingId}
            isViewingToday={isViewingToday}
            buildHandlers={mapHandlers}
            onOpenDetail={openDetail}
            onAddReservation={openManualForm}
          />
        ))}
      </div>
      <ReservationDetailModal />
      <ReservationCancelDialog
        reservation={cancelTarget}
        saving={cancelSaving}
        onClose={closeCancelDialog}
        onConfirm={confirmCancel}
      />
    </>
  );
}
