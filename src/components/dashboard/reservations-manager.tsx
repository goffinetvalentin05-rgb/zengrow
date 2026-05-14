"use client";

import { FormEvent, useMemo, useState } from "react";
import { addDays } from "date-fns";
import { formatInTimeZone, toDate } from "date-fns-tz";
import { createClient } from "@/src/lib/supabase/client";
import GuestAvatar from "@/src/components/dashboard/guest-avatar";
import ReservationListRow from "@/src/components/dashboard/reservation-list-row";
import StatusBadge from "@/src/components/dashboard/status-badge";
import FilterBar from "@/src/components/dashboard/ui/filter-bar";
import ActionMenu from "@/src/components/dashboard/ui/action-menu";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import Textarea from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";
import {
  businessCalendarTimeZone,
  calendarYmdInBusinessTz,
  reservationStartInBusinessTz,
} from "@/src/lib/date/business-calendar";
import { Calendar, MousePointer2 } from "lucide-react";

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
  reservation_type?: "standard" | "walkin";
  table_label?: string | null;
};

type ReservationsManagerProps = {
  initialReservations: ReservationRow[];
  initialShowManualForm?: boolean;
  terraceEnabled?: boolean;
  autoArchiveReservations?: boolean;
  reservationDurationMinutes?: number;
};

type DayStatusFilter = "all" | "confirmed" | "pending" | "cancelled";

function addCalendarDaysYmd(ymd: string, deltaDays: number): string {
  const tz = businessCalendarTimeZone();
  const base = toDate(`${ymd}T12:00:00`, { timeZone: tz });
  return formatInTimeZone(addDays(base, deltaDays), tz, "yyyy-MM-dd");
}

function seatingZoneFromRow(row: ReservationRow): "interior" | "terrace" {
  return row.zone === "terrace" ? "terrace" : "interior";
}

const editableStatuses = ["pending", "confirmed", "refused", "completed", "cancelled", "no-show"] as const;
const statusesWithoutCompleted = ["pending", "confirmed", "refused", "cancelled", "no-show"] as const;

function historyStatusDisplayLabel(reservation: ReservationRow, autoArchive: boolean) {
  if (autoArchive && reservation.status === "completed") return "Archivée";
  return undefined;
}

const STATUS_LABEL_FR: Record<ReservationRow["status"], string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  refused: "Refusée",
  cancelled: "Annulée",
  completed: "Terminée",
  "no-show": "Absent",
};

function reservationDateTimeValue(reservation: ReservationRow) {
  const t = reservationStartInBusinessTz(reservation.reservation_date, reservation.reservation_time).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function sortReservations(values: ReservationRow[]) {
  return [...values].sort((a, b) => reservationDateTimeValue(a) - reservationDateTimeValue(b));
}

const DAY_STATUS_OPTIONS: { value: DayStatusFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "confirmed", label: "Confirmé" },
  { value: "pending", label: "En attente" },
  { value: "cancelled", label: "Annulé" },
];

export default function ReservationsManager({
  initialReservations,
  initialShowManualForm = false,
  terraceEnabled = false,
  autoArchiveReservations = false,
  reservationDurationMinutes = 90,
}: ReservationsManagerProps) {
  void reservationDurationMinutes;
  const supabase = createClient();
  const [reservations, setReservations] = useState(sortReservations(initialReservations));
  const [daySectionDate, setDaySectionDate] = useState(() => calendarYmdInBusinessTz());
  const [daySectionStatus, setDaySectionStatus] = useState<DayStatusFilter>("all");
  const [upcomingRangeStart, setUpcomingRangeStart] = useState(() =>
    addCalendarDaysYmd(calendarYmdInBusinessTz(), 1),
  );
  const [upcomingRangeEnd, setUpcomingRangeEnd] = useState(() =>
    addCalendarDaysYmd(calendarYmdInBusinessTz(), 7),
  );
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
  const [manualWalkInMode, setManualWalkInMode] = useState(false);
  const [showWalkInContactFields, setShowWalkInContactFields] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>(
    Object.fromEntries(initialReservations.map((reservation) => [reservation.id, reservation.internal_note ?? ""])),
  );

  const todayRows = useMemo(() => {
    let rows = reservations.filter((r) => r.reservation_date === daySectionDate);
    if (daySectionStatus === "confirmed") rows = rows.filter((r) => r.status === "confirmed");
    else if (daySectionStatus === "pending") rows = rows.filter((r) => r.status === "pending");
    else if (daySectionStatus === "cancelled") rows = rows.filter((r) => r.status === "cancelled");
    return sortReservations(rows);
  }, [reservations, daySectionDate, daySectionStatus]);

  const upcomingRows = useMemo(() => {
    const bizToday = calendarYmdInBusinessTz();
    const minFuture = addCalendarDaysYmd(bizToday, 1);
    let from = upcomingRangeStart;
    if (from < minFuture) from = minFuture;
    let to = upcomingRangeEnd;
    if (to < from) to = from;
    return sortReservations(reservations.filter((r) => r.reservation_date >= from && r.reservation_date <= to));
  }, [reservations, upcomingRangeStart, upcomingRangeEnd]);

  const isDayFilterToday = daySectionDate === calendarYmdInBusinessTz();

  const selectedReservation = useMemo(() => {
    if (!selectedReservationId) return null;
    return reservations.find((r) => r.id === selectedReservationId) ?? null;
  }, [reservations, selectedReservationId]);

  const detailStatusOptions: readonly ReservationRow["status"][] = useMemo(() => {
    if (!autoArchiveReservations) return editableStatuses;
    if (selectedReservation?.status === "completed") {
      return [...statusesWithoutCompleted, "completed"];
    }
    return statusesWithoutCompleted;
  }, [autoArchiveReservations, selectedReservation?.status]);

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

    setReservations((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
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
        "id, reservation_date, reservation_time, guest_name, guest_phone, guest_email, guests, status, internal_note, created_at, zone, reservation_type",
      )
      .single();

    if (error || !data) {
      setMessage(error?.message ?? "Impossible d'enregistrer la note.");
      setSavingId(null);
      return;
    }

    setReservations((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ...data, table_label: item.table_label } : item,
      ),
    );
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
        note: manualWalkInMode ? undefined : manualNote,
        isWalkIn: manualWalkInMode,
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
    setManualWalkInMode(false);
    setShowWalkInContactFields(false);
    setMessage(createdReservation.reservation_type === "walkin" ? "Walk-in ajouté." : "Réservation ajoutée.");
    setSavingId(null);
  }

  function renderDayTableDesktop(rows: ReservationRow[]) {
    return (
      <div className="overflow-hidden rounded-xl border border-zg-border bg-zg-surface shadow-sm transition-all duration-150">
        <div className="grid grid-cols-[100px_minmax(160px,1fr)_90px_minmax(100px,1fr)_130px] gap-3 border-b border-zg-border bg-zg-surface-elevated px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zg-text-muted">
          <div>Heure</div>
          <div>Client</div>
          <div>Couverts</div>
          <div>Table</div>
          <div className="text-right">Statut</div>
        </div>
        <div className="divide-y divide-zg-border">
          {rows.map((r) => {
            const isSelected = selectedReservationId === r.id;
            const walkin = r.reservation_type === "walkin";
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedReservationId(r.id)}
                className={cn(
                  "grid w-full grid-cols-[100px_minmax(160px,1fr)_90px_minmax(100px,1fr)_130px] items-center gap-3 px-4 py-3 text-left text-sm transition-all duration-150",
                  "hover:bg-zg-card-hover",
                  isSelected && "bg-zg-accent-soft-bg",
                )}
              >
                <div className="font-bold tabular-nums text-zg-teal">{r.reservation_time}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <GuestAvatar name={r.guest_name} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-zg-fg">{r.guest_name}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zg-muted">
                        {walkin ? (
                          <span className="rounded-full border border-zg-warning/35 bg-zg-warning-soft-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zg-warning">
                            Walk-in
                          </span>
                        ) : null}
                        {terraceEnabled ? (
                          <span className="rounded-full border border-zg-border-accent bg-zg-surface-soft/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zg-teal">
                            {seatingZoneFromRow(r) === "terrace" ? "Terrasse" : "Intérieur"}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="font-semibold tabular-nums text-zg-muted">{r.guests}</div>
                <div className="truncate text-zg-muted">{r.table_label ?? "À placer"}</div>
                <div className="flex justify-end">
                  <StatusBadge status={r.status} displayLabel={historyStatusDisplayLabel(r, autoArchiveReservations)} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function renderUpcomingTableDesktop(rows: ReservationRow[]) {
    return (
      <div className="overflow-hidden rounded-xl border border-zg-border bg-zg-surface shadow-sm transition-all duration-150">
        <div className="grid grid-cols-[110px_100px_minmax(160px,1fr)_90px_minmax(100px,1fr)_130px] gap-3 border-b border-zg-border bg-zg-surface-elevated px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zg-text-muted">
          <div>Date</div>
          <div>Heure</div>
          <div>Client</div>
          <div>Couverts</div>
          <div>Table</div>
          <div className="text-right">Statut</div>
        </div>
        <div className="divide-y divide-zg-border">
          {rows.map((r) => {
            const isSelected = selectedReservationId === r.id;
            const walkin = r.reservation_type === "walkin";
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedReservationId(r.id)}
                className={cn(
                  "grid w-full grid-cols-[110px_100px_minmax(160px,1fr)_90px_minmax(100px,1fr)_130px] items-center gap-3 px-4 py-3 text-left text-sm transition-all duration-150",
                  "hover:bg-zg-card-hover",
                  isSelected && "bg-zg-accent-soft-bg",
                )}
              >
                <div className="font-semibold tabular-nums text-zg-muted">{r.reservation_date}</div>
                <div className="font-bold tabular-nums text-zg-teal">{r.reservation_time}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <GuestAvatar name={r.guest_name} size="sm" />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-zg-fg">{r.guest_name}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zg-muted">
                        {walkin ? (
                          <span className="rounded-full border border-zg-warning/35 bg-zg-warning-soft-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zg-warning">
                            Walk-in
                          </span>
                        ) : null}
                        {terraceEnabled ? (
                          <span className="rounded-full border border-zg-border-accent bg-zg-surface-soft/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zg-teal">
                            {seatingZoneFromRow(r) === "terrace" ? "Terrasse" : "Intérieur"}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="font-semibold tabular-nums text-zg-muted">{r.guests}</div>
                <div className="truncate text-zg-muted">{r.table_label ?? "À placer"}</div>
                <div className="flex justify-end">
                  <StatusBadge status={r.status} displayLabel={historyStatusDisplayLabel(r, autoArchiveReservations)} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-10 md:space-y-12">
      {showManualForm ? (
        <form
          onSubmit={createManualReservation}
          className="space-y-5 rounded-xl border border-zg-border bg-zg-surface-elevated/80 p-5 shadow-sm transition-all duration-150 md:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-zg-fg">Nouvelle réservation</p>
              <p className="mt-1 text-sm text-zg-muted">Saisie manuelle (walk-in possible).</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowManualForm(false);
                setManualWalkInMode(false);
                setShowWalkInContactFields(false);
              }}
            >
              Fermer
            </Button>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-zg-border bg-zg-surface p-4 text-sm text-zg-fg">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-zg-border"
              checked={manualWalkInMode}
              onChange={(e) => {
                const on = e.target.checked;
                setManualWalkInMode(on);
                if (on) {
                  setManualGuestName("");
                  setManualGuestPhone("");
                  setManualGuestEmail("");
                  setManualNote("");
                  setShowWalkInContactFields(false);
                } else {
                  setShowWalkInContactFields(false);
                }
              }}
            />
            <span>
              <span className="font-semibold text-zg-fg">Walk-in (client sans réservation)</span>
              <span className="mt-1 block text-zg-muted">
                Enregistrement minimal : date, créneau, couverts{terraceEnabled ? ", zone" : ""}. Le badge Walk-in
                apparaît dans la liste.
              </span>
            </span>
          </label>
          <div className="grid gap-5 md:grid-cols-2">
            {!manualWalkInMode ? (
              <>
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
              </>
            ) : null}
            <div>
              <label className="dashboard-field-label">Date</label>
              <Input
                type="date"
                value={manualReservationDate}
                onChange={(e) => setManualReservationDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="dashboard-field-label">Heure</label>
              <Input
                type="time"
                value={manualReservationTime}
                onChange={(e) => setManualReservationTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="dashboard-field-label">Couverts</label>
              <Input
                type="number"
                min={1}
                value={manualGuests}
                onChange={(e) => setManualGuests(Number(e.target.value))}
                required
              />
            </div>
            {terraceEnabled ? (
              <div className="space-y-2 md:col-span-2">
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
            {manualWalkInMode && !showWalkInContactFields ? (
              <div className="md:col-span-2">
                <button
                  type="button"
                  className="text-sm font-semibold text-zg-teal underline decoration-zg-border-accent underline-offset-2 hover:text-zg-fg"
                  onClick={() => setShowWalkInContactFields(true)}
                >
                  Ajouter nom, email ou téléphone (optionnel)
                </button>
              </div>
            ) : null}
            {manualWalkInMode && showWalkInContactFields ? (
              <>
                <div>
                  <label className="dashboard-field-label">Nom (optionnel)</label>
                  <Input value={manualGuestName} onChange={(e) => setManualGuestName(e.target.value)} />
                </div>
                <div>
                  <label className="dashboard-field-label">Téléphone (optionnel)</label>
                  <Input value={manualGuestPhone} onChange={(e) => setManualGuestPhone(e.target.value)} />
                </div>
                <div>
                  <label className="dashboard-field-label">Email (optionnel)</label>
                  <Input type="email" value={manualGuestEmail} onChange={(e) => setManualGuestEmail(e.target.value)} />
                </div>
              </>
            ) : null}
            {!manualWalkInMode ? (
              <div className="md:col-span-2">
                <label className="dashboard-field-label">Note</label>
                <Textarea className="min-h-24" value={manualNote} onChange={(e) => setManualNote(e.target.value)} />
              </div>
            ) : null}
          </div>
          <Button type="submit" disabled={savingId === "manual-create"}>
            {savingId === "manual-create"
              ? "Enregistrement…"
              : manualWalkInMode
                ? "Ajouter le walk-in"
                : "Enregistrer"}
          </Button>
        </form>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
        <div className="space-y-10 md:space-y-12">
          <div>
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-zg-fg">Réservations du jour</h2>
                <p className="mt-1 text-sm text-zg-text-muted">
                  Toutes les réservations du jour choisi, triées par heure.
                </p>
              </div>
              <ActionMenu
                items={[
                  {
                    kind: "action",
                    label: showManualForm ? "Fermer la saisie" : "Saisie manuelle",
                    onClick: () => setShowManualForm((c) => !c),
                  },
                ]}
              />
            </div>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <FilterBar right={null}>
                  <div className="w-[170px]">
                    <label className="dashboard-field-label">Date</label>
                    <Input type="date" value={daySectionDate} onChange={(e) => setDaySectionDate(e.target.value)} />
                  </div>
                  <div className="w-[210px]">
                    <label className="dashboard-field-label">Statut</label>
                    <Select
                      value={daySectionStatus}
                      onChange={(e) => setDaySectionStatus(e.target.value as DayStatusFilter)}
                    >
                      {DAY_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </FilterBar>

                <div className="hidden md:block">
                  {todayRows.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title="Journée tranquille"
                      description={
                        isDayFilterToday
                          ? "Aucune réservation prévue aujourd'hui."
                          : "Aucune réservation pour cette date."
                      }
                    />
                  ) : (
                    renderDayTableDesktop(todayRows)
                  )}
                </div>
                <div className="md:hidden">
                  {todayRows.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title="Journée tranquille"
                      description={
                        isDayFilterToday
                          ? "Aucune réservation prévue aujourd'hui."
                          : "Aucune réservation pour cette date."
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {todayRows.map((reservation) => (
                        <ReservationListRow
                          key={reservation.id}
                          guestName={reservation.guest_name}
                          timeLabel={reservation.reservation_time}
                          subtitle={`${reservation.guests} couverts · ${reservation.table_label ?? "À placer"}`}
                          status={reservation.status}
                          seatingZone={seatingZoneFromRow(reservation)}
                          reservationType={reservation.reservation_type === "walkin" ? "walkin" : "standard"}
                          onClick={() => setSelectedReservationId(reservation.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <div className="mb-3">
              <h2 className="text-base font-semibold text-zg-fg">Prochaines réservations</h2>
              <p className="mt-1 text-sm text-zg-text-muted">
                À partir de demain, dans l&apos;intervalle de dates (7 jours par défaut).
              </p>
            </div>
            <Card>
              <CardContent className="space-y-4 pt-6">
                <FilterBar right={null}>
                  <div className="w-[170px]">
                    <label className="dashboard-field-label">Du</label>
                    <Input
                      type="date"
                      value={upcomingRangeStart}
                      onChange={(e) => setUpcomingRangeStart(e.target.value)}
                    />
                  </div>
                  <div className="w-[170px]">
                    <label className="dashboard-field-label">Au</label>
                    <Input type="date" value={upcomingRangeEnd} onChange={(e) => setUpcomingRangeEnd(e.target.value)} />
                  </div>
                </FilterBar>

                <div className="hidden md:block">
                  {upcomingRows.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title="Pas de réservations à venir"
                      description="Tu n&apos;as pas encore de réservations à venir."
                    />
                  ) : (
                    renderUpcomingTableDesktop(upcomingRows)
                  )}
                </div>
                <div className="md:hidden">
                  {upcomingRows.length === 0 ? (
                    <EmptyState
                      icon={Calendar}
                      title="Pas de réservations à venir"
                      description="Tu n&apos;as pas encore de réservations à venir."
                    />
                  ) : (
                    <div className="space-y-3">
                      {upcomingRows.map((reservation) => (
                        <ReservationListRow
                          key={reservation.id}
                          guestName={reservation.guest_name}
                          timeLabel={`${reservation.reservation_date} · ${reservation.reservation_time}`}
                          subtitle={`${reservation.guests} couverts · ${reservation.table_label ?? "À placer"}`}
                          status={reservation.status}
                          seatingZone={seatingZoneFromRow(reservation)}
                          reservationType={reservation.reservation_type === "walkin" ? "walkin" : "standard"}
                          onClick={() => setSelectedReservationId(reservation.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

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
                        {terraceEnabled ? (
                          <span className="rounded-full border border-zg-success/35 bg-zg-success-soft-bg px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-zg-success">
                            {seatingZoneFromRow(selectedReservation) === "terrace" ? "Terrasse" : "Intérieur"}
                          </span>
                        ) : null}
                        <StatusBadge
                          status={selectedReservation.status}
                          displayLabel={historyStatusDisplayLabel(selectedReservation, autoArchiveReservations)}
                        />
                      </CardDescription>
                      <p className="mt-3 text-sm text-zg-muted">
                        {selectedReservation.guest_phone || selectedReservation.guest_email || "Pas de contact"}
                      </p>
                    </div>
                  </div>

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
      </div>
    </section>
  );
}
