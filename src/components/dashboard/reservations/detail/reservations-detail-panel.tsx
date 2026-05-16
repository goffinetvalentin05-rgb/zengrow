"use client";

import GuestAvatar from "@/src/components/dashboard/guest-avatar";
import StatusBadge from "@/src/components/dashboard/status-badge";
import {
  STATUS_LABEL_FR,
  historyStatusDisplayLabel,
} from "@/src/components/dashboard/reservations/constants";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import type { ReservationStatus } from "@/src/components/dashboard/reservations/types";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { MousePointer2 } from "lucide-react";

export default function ReservationsDetailPanel() {
  const {
    selectedReservation,
    showZoneUi,
    zoneLabelTerrace,
    autoArchiveReservations,
    seatingZoneFromRow,
    updateStatus,
    savingId,
    detailStatusOptions,
    noteDrafts,
    setNoteDrafts,
    saveNote,
    message,
  } = useReservations();

  return (
    <div className="space-y-6 lg:sticky lg:top-6">
      <Card>
        <CardHeader>
          <CardTitle>Détails</CardTitle>
          <CardDescription>
            {selectedReservation ? "Modifiez le statut et la note interne." : "Choisis une ligne"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {!selectedReservation ? (
            <EmptyState
              icon={MousePointer2}
              title="Choisis une ligne"
              description="Clique sur une réservation dans l'une des listes pour afficher les détails, le statut et la note interne."
            />
          ) : (
            <>
              <div className="flex flex-wrap items-start gap-4">
                <GuestAvatar name={selectedReservation.guest_name} size="lg" />
                <div className="min-w-0">
                  <CardTitle>{selectedReservation.guest_name}</CardTitle>
                  <CardDescription className="mt-2 flex flex-wrap items-center gap-2">
                    <span>
                      {selectedReservation.reservation_date} à {selectedReservation.reservation_time} ·{" "}
                      {selectedReservation.guests} couverts
                    </span>
                    {selectedReservation.reservation_type === "walkin" ? (
                      <span className="rounded-full border border-zg-warning/35 bg-zg-warning-soft-bg px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zg-warning">
                        Walk-in
                      </span>
                    ) : null}
                    {showZoneUi ? (
                      <span className="rounded-full border border-zg-success/35 bg-zg-success-soft-bg px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zg-success">
                        {seatingZoneFromRow(selectedReservation) === "terrace" ? zoneLabelTerrace : "Salle"}
                      </span>
                    ) : null}
                    <StatusBadge
                      status={selectedReservation.status}
                      displayLabel={historyStatusDisplayLabel(
                        selectedReservation,
                        autoArchiveReservations,
                      )}
                    />
                  </CardDescription>
                  <p className="mt-3 text-sm text-zg-muted">
                    {selectedReservation.guest_phone ||
                      selectedReservation.guest_email ||
                      "Pas de contact"}
                  </p>
                </div>
              </div>

              {selectedReservation.status === "pending" ? (
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                        onClick={() =>
                          void updateStatus(selectedReservation.id, "confirmed", {
                            successMessage: "Réservation confirmée.",
                          })
                        }
                    disabled={savingId === selectedReservation.id}
                  >
                    Confirmer
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                        onClick={() =>
                          void updateStatus(selectedReservation.id, "refused", {
                            successMessage: "Réservation refusée.",
                          })
                        }
                    disabled={savingId === selectedReservation.id}
                  >
                    Refuser
                  </Button>
                </div>
              ) : null}

              <div>
                <label className="dashboard-field-label">Statut</label>
                <Select
                  value={selectedReservation.status}
                  onChange={(e) =>
                    void updateStatus(
                      selectedReservation.id,
                      e.target.value as ReservationStatus,
                    )
                  }
                  disabled={savingId === selectedReservation.id}
                >
                  {detailStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {autoArchiveReservations && status === "completed"
                        ? "Archivée (ancien statut)"
                        : STATUS_LABEL_FR[status]}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="dashboard-field-label">Note interne</label>
                <Textarea
                  className="min-h-28"
                  value={noteDrafts[selectedReservation.id] ?? ""}
                  onChange={(e) =>
                    setNoteDrafts((current) => ({
                      ...current,
                      [selectedReservation.id]: e.target.value,
                    }))
                  }
                  placeholder="Pour l’équipe…"
                />
                <div className="mt-3">
                  <Button
                    type="button"
                    onClick={() => saveNote(selectedReservation.id)}
                    disabled={savingId === selectedReservation.id}
                  >
                    Enregistrer la note
                  </Button>
                </div>
              </div>
            </>
          )}

          {message ? <p className="text-sm text-zg-muted">{message}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
