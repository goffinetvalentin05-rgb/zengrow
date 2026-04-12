"use client";

import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import GuestAvatar from "@/src/components/dashboard/guest-avatar";
import ReservationListRow from "@/src/components/dashboard/reservation-list-row";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";

type ReservationRow = {
  id: string;
  reservation_date: string;
  reservation_time: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  guests: number;
  status: "pending" | "confirmed" | "refused" | "cancelled" | "completed" | "no-show";
  internal_note: string | null;
  created_at: string;
  zone?: "interior" | "terrace" | string | null;
};

type ReservationsManagerProps = {
  initialReservations: ReservationRow[];
  initialShowManualForm?: boolean;
  terraceEnabled?: boolean;
};

function seatingZoneFromRow(row: ReservationRow): "interior" | "terrace" {
  return row.zone === "terrace" ? "terrace" : "interior";
}

const editableStatuses = ["pending", "confirmed", "refused", "completed", "cancelled", "no-show"] as const;

const STATUS_LABEL_FR: Record<ReservationRow["status"], string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  refused: "Refusée",
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

export default function ReservationsManager({
  initialReservations,
  initialShowManualForm = false,
  terraceEnabled = false,
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
  const [manualZone, setManualZone] = useState<"interior" | "terrace">("interior");
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
      current.map((item) => (item.id === id ? { ...item, status } : item)),
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
        "id, reservation_date, reservation_time, guest_name, guest_phone, guest_email, guests, status, internal_note, created_at, zone",
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
        ...(terraceEnabled ? { zone: manualZone } : {}),
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
    setNoteDrafts((current) => ({ ...current, [createdReservation.id]: createdReservation.internal_note ?? "" }));
    setSelectedReservationId(createdReservation.id);
    setShowManualForm(false);
    setManualGuestName("");
    setManualGuestPhone("");
    setManualGuestEmail("");
    setManualReservationDate("");
    setManualReservationTime("");
    setManualGuests(2);
    setManualZone("interior");
    setManualNote("");
    setMessage("Réservation ajoutée.");
    setSavingId(null);
  }

  return (
    <section className="space-y-10 md:space-y-12">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>Liste</CardTitle>
            <CardDescription>Filtrez puis cliquez une ligne pour agir.</CardDescription>
          </div>
          <Button type="button" variant="primary" onClick={() => setShowManualForm((c) => !c)}>
            {showManualForm ? "Annuler" : "Nouvelle réservation"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-10">
          {showManualForm ? (
            <form onSubmit={createManualReservation} className="space-y-5 border-t border-gray-100 pt-8">
              <p className="text-sm font-medium text-gray-900">Saisie rapide</p>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="dashboard-field-label">Nom</label>
                  <Input value={manualGuestName} onChange={(e) => setManualGuestName(e.target.value)} required />
                </div>
                <div>
                  <label className="dashboard-field-label">Téléphone</label>
                  <Input value={manualGuestPhone} onChange={(e) => setManualGuestPhone(e.target.value)} required />
                </div>
                <div>
                  <label className="dashboard-field-label">Email</label>
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
                  <label className="dashboard-field-label">Couverts</label>
                  <Input type="number" min={1} value={manualGuests} onChange={(e) => setManualGuests(Number(e.target.value))} required />
                </div>
                {terraceEnabled ? (
                  <div className="md:col-span-2 space-y-2">
                    <p className="dashboard-field-label">Zone</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="manual-zone"
                          value="interior"
                          checked={manualZone === "interior"}
                          onChange={() => setManualZone("interior")}
                          required
                        />
                        Intérieur
                      </label>
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="radio"
                          name="manual-zone"
                          value="terrace"
                          checked={manualZone === "terrace"}
                          onChange={() => setManualZone("terrace")}
                          required
                        />
                        Terrasse
                      </label>
                    </div>
                  </div>
                ) : null}
                <div className="md:col-span-2">
                  <label className="dashboard-field-label">Note</label>
                  <Textarea className="min-h-24" value={manualNote} onChange={(e) => setManualNote(e.target.value)} />
                </div>
              </div>
              <Button type="submit" disabled={savingId === "manual-create"}>
                {savingId === "manual-create" ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </form>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="dashboard-field-label">Date</label>
              <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            </div>
            <div>
              <label className="dashboard-field-label">Statut</label>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as "all" | ReservationRow["status"])}>
                <option value="all">Tous</option>
                {editableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABEL_FR[status]}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="hidden md:block">
            {filteredReservations.length === 0 ? (
              <EmptyState title="Aucune réservation" description="Modifiez les filtres." />
            ) : (
              <div className="space-y-3">
                {filteredReservations.map((reservation) => (
                  <ReservationListRow
                    key={reservation.id}
                    guestName={reservation.guest_name}
                    timeLabel={reservation.reservation_time}
                    subtitle={`${reservation.reservation_date} · ${reservation.guests} couverts`}
                    status={reservation.status}
                    seatingZone={seatingZoneFromRow(reservation)}
                    emphasizeTime
                    onClick={() => setSelectedReservationId(reservation.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="md:hidden">
            {filteredReservations.length === 0 ? (
              <EmptyState title="Aucune réservation" description="Modifiez les filtres." />
            ) : (
              <div className="space-y-3">
                {filteredReservations.map((reservation) => (
                  <ReservationListRow
                    key={reservation.id}
                    guestName={reservation.guest_name}
                    timeLabel={`${reservation.reservation_date} · ${reservation.reservation_time}`}
                    subtitle={`${reservation.guests} couverts`}
                    status={reservation.status}
                    seatingZone={seatingZoneFromRow(reservation)}
                    onClick={() => setSelectedReservationId(reservation.id)}
                  />
                ))}
              </div>
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
                <CardTitle>{selectedReservation.guest_name}</CardTitle>
                <CardDescription className="mt-2 flex flex-wrap items-center gap-2">
                  <span>
                    {selectedReservation.reservation_date} à {selectedReservation.reservation_time} ·{" "}
                    {selectedReservation.guests} couverts
                  </span>
                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-900">
                    {seatingZoneFromRow(selectedReservation) === "terrace" ? "Terrasse" : "Intérieur"}
                  </span>
                </CardDescription>
                <p className="mt-3 text-sm text-gray-500">
                  {selectedReservation.guest_phone || selectedReservation.guest_email || "Pas de contact"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {selectedReservation.status === "pending" ? (
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => updateStatus(selectedReservation.id, "confirmed")}
                  disabled={savingId === selectedReservation.id}
                >
                  Confirmer
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => updateStatus(selectedReservation.id, "refused")}
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
                <Button type="button" onClick={() => saveNote(selectedReservation.id)} disabled={savingId === selectedReservation.id}>
                  Enregistrer la note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {message ? <p className="text-sm text-gray-600">{message}</p> : null}
    </section>
  );
}
