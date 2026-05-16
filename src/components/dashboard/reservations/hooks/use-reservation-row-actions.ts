"use client";

import { useCallback, useState } from "react";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import type { ReservationQuickActionHandlers } from "@/src/components/dashboard/reservations/list-row/reservation-quick-actions";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
export function useReservationRowActions() {
  const { updateStatus, setSelectedReservationId } = useReservations();
  const [cancelTarget, setCancelTarget] = useState<ReservationRow | null>(null);
  const [cancelSaving, setCancelSaving] = useState(false);

  const buildHandlers = useCallback(
    (reservation: ReservationRow): ReservationQuickActionHandlers => ({
      onConfirm: () => {
        void updateStatus(reservation.id, "confirmed", {
          successMessage: "Réservation confirmée.",
        });
      },
      onCancel: () => setCancelTarget(reservation),
      onNoShow: () => {
        if (
          !window.confirm(
            `Marquer ${reservation.guest_name} comme absent (no-show) ?`,
          )
        ) {
          return;
        }
        void updateStatus(reservation.id, "no-show", {
          successMessage: "No-show enregistré.",
        });
      },
      onArrived: () => {
        void updateStatus(reservation.id, "completed", {
          successMessage: "Arrivée enregistrée.",
        });
      },
      onCall: () => {
        const phone = reservation.guest_phone?.trim();
        if (!phone) return;
        window.location.href = `tel:${phone.replace(/\s/g, "")}`;
      },
      onMessage: () => {
        const email = reservation.guest_email?.trim();
        if (!email) return;
        const subject = encodeURIComponent(
          `Votre réservation du ${reservation.reservation_date}`,
        );
        const body = encodeURIComponent(
          `Bonjour ${reservation.guest_name},\n\nConcernant votre réservation du ${reservation.reservation_date} à ${reservation.reservation_time.slice(0, 5)}…\n\n`,
        );
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      },
      onEdit: () => setSelectedReservationId(reservation.id),
    }),
    [updateStatus, setSelectedReservationId],
  );

  const closeCancelDialog = useCallback(() => {
    if (cancelSaving) return;
    setCancelTarget(null);
  }, [cancelSaving]);

  const confirmCancel = useCallback(
    async (_reason: string) => {
      if (!cancelTarget) return;
      setCancelSaving(true);
      const ok = await updateStatus(cancelTarget.id, "cancelled", {
        successMessage: "Réservation annulée.",
      });
      setCancelSaving(false);
      if (ok) setCancelTarget(null);
    },
    [cancelTarget, updateStatus],
  );

  return {
    buildHandlers,
    cancelTarget,
    cancelSaving,
    closeCancelDialog,
    confirmCancel,
  };
}
