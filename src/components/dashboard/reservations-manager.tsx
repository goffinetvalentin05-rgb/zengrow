"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import StatusBadge from "@/src/components/dashboard/status-badge";
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
  status: "pending" | "confirmed" | "rejected" | "cancelled" | "completed" | "no-show";
  internal_note: string | null;
  created_at: string;
};

type ReservationsManagerProps = {
  initialReservations: ReservationRow[];
};

const editableStatuses = ["pending", "confirmed", "rejected", "completed", "cancelled", "no-show"] as const;

export default function ReservationsManager({ initialReservations }: ReservationsManagerProps) {
  const supabase = createClient();
  const [reservations, setReservations] = useState(initialReservations);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | ReservationRow["status"]>("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedReservationId, setSelectedReservationId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>(
    Object.fromEntries(
      initialReservations.map((reservation) => [reservation.id, reservation.internal_note ?? ""]),
    ),
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

  return (
    <section className="space-y-6">
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Réservations</CardTitle>
          <CardDescription>
            Vue claire des réservations, avec filtres rapides par date et statut.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Date</label>
              <Input type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Statut</label>
              <Select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value as "all" | ReservationRow["status"])}
              >
                <option value="all">Tous</option>
                {editableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-[var(--surface-muted)] text-left text-[var(--muted-foreground)]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nom client</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Heure</th>
                  <th className="px-4 py-3 font-semibold">Personnes</th>
                  <th className="px-4 py-3 font-semibold">Statut</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4">
                      <EmptyState title="Aucune réservation" description="Aucun résultat avec ces filtres." />
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[var(--foreground)]">{reservation.guest_name}</p>
                      </td>
                      <td className="px-4 py-3 text-[var(--foreground)]/75">{reservation.reservation_date}</td>
                      <td className="px-4 py-3 text-[var(--foreground)]/75">{reservation.reservation_time}</td>
                      <td className="px-4 py-3 text-[var(--foreground)]/75">{reservation.guests}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={reservation.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {reservation.status === "pending" ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => updateStatus(reservation.id, "confirmed")}
                                disabled={savingId === reservation.id}
                              >
                                Confirmer
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="danger"
                                onClick={() => updateStatus(reservation.id, "rejected")}
                                disabled={savingId === reservation.id}
                              >
                                Refuser
                              </Button>
                            </>
                          ) : null}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedReservationId(reservation.id)}
                          >
                            Voir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 pt-4 md:hidden">
            {filteredReservations.length === 0 ? (
              <EmptyState title="Aucune réservation" description="Essayez d'ajuster vos filtres." />
            ) : (
              filteredReservations.map((reservation) => (
                <button
                  key={reservation.id}
                  type="button"
                  onClick={() => setSelectedReservationId(reservation.id)}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-left"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-[var(--foreground)]">{reservation.guest_name}</p>
                    <StatusBadge status={reservation.status} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    {reservation.reservation_date} à {reservation.reservation_time} - {reservation.guests} couverts
                  </p>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {selectedReservation ? (
        <Card className="rounded-3xl">
          <CardHeader>
          <CardTitle>Détail de la réservation</CardTitle>
            <CardDescription>Voir, modifier ou annuler rapidement.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-[1fr_1fr]">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-[var(--foreground)]">{selectedReservation.guest_name}</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {selectedReservation.reservation_date} à {selectedReservation.reservation_time}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">{selectedReservation.guests} couverts</p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Contact : {selectedReservation.guest_phone || selectedReservation.guest_email || "-"}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Statut</label>
                <Select
                  value={selectedReservation.status}
                  onChange={(event) =>
                    updateStatus(selectedReservation.id, event.target.value as ReservationRow["status"])
                  }
                  disabled={savingId === selectedReservation.id}
                >
                  {editableStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--foreground)]/80">Note interne</label>
                <Textarea
                  className="min-h-24"
                  value={noteDrafts[selectedReservation.id] ?? ""}
                  onChange={(event) =>
                    setNoteDrafts((current) => ({
                      ...current,
                      [selectedReservation.id]: event.target.value,
                    }))
                  }
                  placeholder="Informations utiles pour l'equipe salle."
                />
              </div>

              <Button
                type="button"
                onClick={() => saveNote(selectedReservation.id)}
                disabled={savingId === selectedReservation.id}
              >
                Enregistrer
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {message && (
        <p className="rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)]/80 shadow-sm">
          {message}
        </p>
      )}
    </section>
  );
}
