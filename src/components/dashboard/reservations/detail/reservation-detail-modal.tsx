"use client";

import { useEffect, useRef } from "react";
import { STATUS_LABEL_FR } from "@/src/components/dashboard/reservations/constants";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import ReservationsGuestAvatar from "@/src/components/dashboard/reservations/list-row/reservations-guest-avatar";
import { formatYmdLongFr } from "@/src/components/dashboard/reservations/utils/reservation-date-format";
import { formatGuestPhoneDisplay } from "@/src/components/dashboard/reservations/utils/reservation-list-metadata";
import Button from "@/src/components/ui/button";
import { zoneDisplayLabel } from "@/src/lib/reservation/terrace-settings";
import { X } from "lucide-react";

/** Modal détail — version intermédiaire (étape 3) ; enrichi à l’étape 4. */
export default function ReservationDetailModal() {
  const {
    selectedReservation,
    setSelectedReservationId,
    showZoneUi,
    zoneLabelTerrace,
    seatingZoneFromRow,
  } = useReservations();

  const panelRef = useRef<HTMLDivElement>(null);
  const open = selectedReservation != null;

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedReservationId(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setSelectedReservationId]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!selectedReservation) return null;

  const timeLabel = selectedReservation.reservation_time.trim().slice(0, 5);
  const zone = seatingZoneFromRow(selectedReservation);
  const zoneLabel = showZoneUi ? zoneDisplayLabel(zone, zoneLabelTerrace) : null;
  const phone = formatGuestPhoneDisplay(selectedReservation.guest_phone);
  const note = selectedReservation.internal_note?.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={() => setSelectedReservationId(null)}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-detail-title"
        tabIndex={-1}
        className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-zg-border bg-zg-surface shadow-xl transition-all duration-200 sm:max-h-[min(90dvh,720px)] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-zg-border px-5 py-4">
          <h2 id="reservation-detail-title" className="text-lg font-semibold text-zg-fg">
            Détail de la réservation
          </h2>
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setSelectedReservationId(null)}
            className="rounded-lg p-2 text-zg-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-6">
          <div className="flex items-center gap-4">
            <ReservationsGuestAvatar name={selectedReservation.guest_name} size="lg" variant="solid" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold uppercase tracking-wide text-zg-fg">
                {selectedReservation.guest_name}
              </p>
              <p className="mt-1 text-xs text-zg-text-muted">
                Réservation #{selectedReservation.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <ul className="mt-6 space-y-3 rounded-xl border border-zg-border bg-zg-surface-elevated/50 p-4 text-sm">
            <li>
              <span className="text-zg-text-muted">Date · </span>
              <span className="font-medium text-zg-fg">
                {formatYmdLongFr(selectedReservation.reservation_date)} à {timeLabel}
              </span>
            </li>
            <li>
              <span className="text-zg-text-muted">Couverts · </span>
              <span className="font-medium text-zg-fg">{selectedReservation.guests} personnes</span>
            </li>
            {zoneLabel ? (
              <li>
                <span className="text-zg-text-muted">Zone · </span>
                <span className="font-medium text-zg-fg">{zoneLabel}</span>
              </li>
            ) : null}
            <li>
              <span className="text-zg-text-muted">Statut · </span>
              <span className="font-medium text-zg-fg">
                {STATUS_LABEL_FR[selectedReservation.status]}
              </span>
            </li>
          </ul>

          {phone ? (
            <p className="mt-4 text-sm text-zg-fg">
              <span className="text-zg-text-muted">Téléphone · </span>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-medium hover:text-zg-accent">
                {phone}
              </a>
            </p>
          ) : null}

          {note ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-zg-text-muted">
                Demandes spéciales
              </p>
              <p className="mt-1 text-sm text-zg-fg">{note}</p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 justify-end border-t border-zg-border px-5 py-4">
          <Button type="button" onClick={() => setSelectedReservationId(null)}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
