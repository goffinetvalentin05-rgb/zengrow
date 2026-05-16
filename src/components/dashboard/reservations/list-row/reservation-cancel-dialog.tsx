"use client";

import { useEffect, useState } from "react";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
import Button from "@/src/components/ui/button";
import Textarea from "@/src/components/ui/textarea";

type ReservationCancelDialogProps = {
  reservation: ReservationRow | null;
  saving: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export default function ReservationCancelDialog({
  reservation,
  saving,
  onClose,
  onConfirm,
}: ReservationCancelDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (reservation) setReason("");
  }, [reservation?.id]);

  if (!reservation) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="presentation"
      onClick={() => !saving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-cancel-title"
        className="w-full max-w-md rounded-2xl border border-zg-border bg-zg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="reservation-cancel-title" className="text-lg font-semibold text-zg-fg">
          Annuler la réservation ?
        </h2>
        <p className="mt-2 text-sm text-zg-muted">
          {reservation.guest_name} · {reservation.reservation_date} à{" "}
          {reservation.reservation_time.slice(0, 5)} · {reservation.guests} couverts
        </p>
        <div className="mt-4">
          <label className="dashboard-field-label" htmlFor="cancel-reason">
            Raison (optionnelle)
          </label>
          <Textarea
            id="cancel-reason"
            className="mt-1.5 min-h-20"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Pour l'équipe…"
          />
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" disabled={saving} onClick={onClose}>
            Retour
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={saving}
            onClick={() => onConfirm(reason.trim())}
          >
            {saving ? "Annulation…" : "Confirmer l'annulation"}
          </Button>
        </div>
      </div>
    </div>
  );
}

