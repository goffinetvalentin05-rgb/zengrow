"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import GuestAvatar from "@/src/components/dashboard/guest-avatar";
import ReservationListRow from "@/src/components/dashboard/reservation-list-row";
import StatusBadge from "@/src/components/dashboard/status-badge";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";

type ReservationRow = {
  id: string;
  reservation_date: string;
  reservation_time: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  guests: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled" | "completed" | "no-show";
  internal_note: string | null;
  created_at: string;
};

type ReservationsManagerProps = {
  initialReservations: ReservationRow[];
  initialShowManualForm?: boolean;
};

const editableStatuses = ["pending", "confirmed", "rejected", "completed", "cancelled", "no-show"] as const;

const STATUS_LABEL_FR: Record<ReservationRow["status"], string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  rejected: "Refusée",
  cancelled: "Annulée",
  completed: "Terminée",
  "no-show": "Absent",
};

function reservationDateTimeValue(reservation: ReservationRow) {
  return new Date(`${reservation.reservation_date}T${reservation.reservation_time}`).getTime();
}

function sortReservations(values: ReservationRow[]) {
  return [...values].sort((a, b) => reservationDateTimeValue(b) - reservationDateTimeValue(a));
}

function DesktopReservationRow({
  reservation,
  savingId,
  onSelect,
  onConfirm,
  onReject,
}: {
  reservation: ReservationRow;
  savingId: string | null;
  onSelect: () => void;
  onConfirm: () => void;
  onReject: () => void;
}) {
  return (
    <div
      className={cn(
        "hidden rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface-card)] px-5 py-4 shadow-[var(--card-shadow)] transition duration-200 md:block",
        "hover:shadow-[var(--card-shadow-hover)]",
      )}
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <GuestAvatar name={reservation.guest_name} size="sm" />
          <span className="truncate text-[15px] font-semibold text-[var(--foreground)]">{reservation.guest_name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-[13px] tabular-nums text-[var(--muted-foreground)]">
          <span>{reservation.reservation_date}</span>
          <span className="font-medium text-[var(--foreground)]">{reservation.reservation_time}</span>
          <span>{reservation.guests} pers.</span>
        </div>
        <StatusBadge status={reservation.status} />
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-[var(--border-soft)] pt-4">
        {reservation.status === "pending" ? (
          <>
            <Button type="button" size="sm" variant="secondary" onClick={onConfirm} disabled={savingId === reservation.id}>
              Confirmer
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={onReject} disabled={savingId === reservation.id}>
              Refuser
            </Button>
          </>
        ) : null}
        <Button type="button" size="sm" variant="ghost" onClick={onSelect}>
          Détails
        </Button>
      </div>
    </div>
  );
}

export default function ReservationsManager({
  initialReservations,
  initialShowManualForm = false,
}: ReservationsManagerProps) {
  const supabase = createClient();
  const [reservations, setReservations] = useState(sortReservations(initialReservations));
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | ReservationRow["status"]>("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(initialShowManualForm);
  const [manualGuestName, setManualGuestName] = useState("");
  const [manualGuestPhone, setManualGuestPhone] = useState("");
  const [manualGuestEmail, setManualGuestEmail] = useState("");
  const [manualReservationDate, setManualReservationDate] = useState("");
  const [manualReservationTime, setManualReservationTime] = useState("");
  const [manualGuests, setManualGuests] = useState(2);
  const [manualNote, setManualNote] = useState("");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>(
    Object.fromEntries(initialReservations.map((reservation) => [reservation.id, reservation.internal_note ?? ""])),
  );

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      if (filterDate && reservation.reservation_date !== filterDate) return false;
      if (filterStatus !== "all" && reservation.status !== filterStatus) return false;
      return true;
    });
  }, [reservations, filterDate, filterStatus]);

  const selectedReservation =
    filteredReservations.find((reservation) => reservation.id === selectedReservationId) ?? null;

  async function updateStatus(id: string, status: ReservationRow["status"]) {
    setMessage(null);
    setSavingId(id);

    const response = await fetch(`/api/reservations/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Impossible de mettre à jour le statut.");
      setSavingId(null);
      return;
    }

    setReservations((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
            }
          : item,
      ),
    );
    setMessage("Statut mis à jour.");
    setSavingId(null);
  }

  async function saveNote(id: string) {
    setMessage(null);
    setSavingId(id);

    const internal_note = noteDrafts[id] ?? "";
    const { data, error } = await supabase
      .from("reservations")
      .update({ internal_note })
      .eq("id", id)
      .select(
        "id, reservation_date, reservation_time, guest_name, guest_phone, guest_email, guests, status, internal_note, created_at",
      )
      .single();

    if (error || !data) {
      setMessage(error?.message ?? "Impossible d'enregistrer la note.");
      setSavingId(null);
      return;
    }

    setReservations((current) => current.map((item) => (item.id === id ? data : item)));
    setMessage("Note enregistrée.");
    setSavingId(null);
  }

  async function createManualReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSavingId("manual-create");

    const response = await fetch("/api/reservations/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName: manualGuestName,
        guestPhone: manualGuestPhone,
        guestEmail: manualGuestEmail,
        reservationDate: manualReservationDate,
        reservationTime: manualReservationTime,
        guests: manualGuests,
        note: manualNote,
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string; reservation?: ReservationRow };
    if (!response.ok || !payload.reservation) {
      setMessage(payload.error ?? "Impossible de créer la réservation.");
      setSavingId(null);
      return;
    }

    const createdReservation = payload.reservation;
    setReservations((current) => sortReservations([createdReservation, ...current]));
    setNoteDrafts((current) => ({
      ...current,
      [createdReservation.id]: createdReservation.internal_note ?? "",
    }));
    setSelectedReservationId(createdReservation.id);
    setShowManualForm(false);
    setManualGuestName("");
    setManualGuestPhone("");
    setManualGuestEmail("");
    setManualReservationDate("");
    setManualReservationTime("");
    setManualGuests(2);
    setManualNote("");
    setMessage("Réservation ajoutée et confirmée.");
    setSavingId(null);
  }

  return (
    <section className="space-y-12">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Toutes les demandes</CardTitle>
            <CardDescription>Filtrez par date ou statut, puis ouvrez le détail pour ajuster.</CardDescription>
          </div>
          <Button type="button" variant={showManualForm ? "secondary" : "primary"} onClick={() => setShowManualForm((c) => !c)}>
            {showManualForm ? "Fermer le formulaire" : "Ajouter une réservation"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {showManualForm ? (
            <form
              onSubmit={createManualReservation}
              className="space-y-5 rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface-muted)]/60 p-6 md:p-8"
            >
              <p className="text-[15px] font-semibold text-[var(--foreground)]">Nouvelle réservation</p>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="dashboard-field-label">Nom du client</label>
                  <Input value={manualGuestName} onChange={(e) => setManualGuestName(e.target.value)} required />
                </div>
                <div>
                  <label className="dashboard-field-label">Téléphone</label>
                  <Input value={manualGuestPhone} onChange={(e) => setManualGuestPhone(e.target.value)} required />
                </div>
                <div>
                  <label className="dashboard-field-label">Email (optionnel)</label>
                  <Input type="email" value={manualGuestEmail} onChange={(e) => setManualGuestEmail(e.target.value)} />
                </div>
                <div>
                  <label className="dashboard-field-label">Date</label>
                  <Input type="date" value={manualReservationDate} onChange={(e) => setManualReservationDate(e.target.value)} required />
                </div>
                <div>
                  <label className="dashboard-field-label">Heure</label>
                  <Input type="time" value={manualReservationTime} onChange={(e) => setManualReservationTime(e.target.value)} required />
                </div>
                <div>
                  <label className="dashboard-field-label">Nombre de personnes</label>
                  <Input type="number" min={1} value={manualGuests} onChange={(e) => setManualGuests(Number(e.target.value))} required />
                </div>
                <div className="md:col-span-2">
                  <label className="dashboard-field-label">Note (optionnel)</label>
                  <Textarea className="min-h-24" value={manualNote} onChange={(e) => setManualNote(e.target.value)} />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={savingId === "manual-create"}>
                  {savingId === "manual-create" ? "Enregistrement..." : "Enregistrer la réservation"}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowManualForm(false)} disabled={savingId === "manual-create"}>
                  Annuler
                </Button>
              </div>
            </form>
          ) : null}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="dashboard-field-label">Filtrer par date</label>
              <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            </div>
            <div>
              <label className="dashboard-field-label">Statut</label>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as "all" | ReservationRow["status"])}>
                <option value="all">Tous les statuts</option>
                {editableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABEL_FR[status]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="hidden md:block">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
              Liste des réservations
            </p>
            <div className="space-y-3">
              {filteredReservations.length === 0 ? (
                <EmptyState title="Aucune réservation" description="Aucun résultat avec ces filtres." />
              ) : (
                filteredReservations.map((reservation) => (
                  <DesktopReservationRow
                    key={reservation.id}
                    reservation={reservation}
                    savingId={savingId}
                    onSelect={() => setSelectedReservationId(reservation.id)}
                    onConfirm={() => updateStatus(reservation.id, "confirmed")}
                    onReject={() => updateStatus(reservation.id, "rejected")}
                  />
                ))
              )}
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {filteredReservations.length === 0 ? (
              <EmptyState title="Aucune réservation" description="Essayez d'ajuster vos filtres." />
            ) : (
              filteredReservations.map((reservation) => (
                <ReservationListRow
                  key={reservation.id}
                  guestName={reservation.guest_name}
                  timeLabel={`${reservation.reservation_date} · ${reservation.reservation_time}`}
                  subtitle={`${reservation.guests} couverts`}
                  status={reservation.status}
                  onClick={() => setSelectedReservationId(reservation.id)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedReservation ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start gap-4">
              <GuestAvatar name={selectedReservation.guest_name} size="lg" />
              <div>
                <CardTitle className="!mt-0">{selectedReservation.guest_name}</CardTitle>
                <CardDescription>
                  {selectedReservation.reservation_date} à {selectedReservation.reservation_time} · {selectedReservation.guests}{" "}
                  couverts
                </CardDescription>
                <p className="dashboard-section-subtitle mt-3">
                  Contact : {selectedReservation.guest_phone || selectedReservation.guest_email || "—"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <div>
                <label className="dashboard-field-label">Statut</label>
                <Select
                  value={selectedReservation.status}
                  onChange={(e) => updateStatus(selectedReservation.id, e.target.value as ReservationRow["status"])}
                  disabled={savingId === selectedReservation.id}
                >
                  {editableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABEL_FR[status]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-4">
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
                  placeholder="Infos pour l'équipe en salle…"
                />
              </div>
              <Button type="button" onClick={() => saveNote(selectedReservation.id)} disabled={savingId === selectedReservation.id}>
                Enregistrer la note
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {message ? (
        <p className="rounded-[20px] border border-[var(--border-soft)] bg-[var(--surface-muted)]/70 px-5 py-4 text-[14px] text-[var(--foreground)]/90 shadow-[var(--card-shadow)]">
          {message}
        </p>
      ) : null}
    </section>
  );
}
