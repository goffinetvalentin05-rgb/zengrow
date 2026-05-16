"use client";

import { FormEvent, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import {
  EDITABLE_STATUSES,
  RESERVATION_SELECT_COLUMNS,
  STATUSES_WITHOUT_COMPLETED,
} from "@/src/components/dashboard/reservations/constants";
import {
  ReservationsContext,
  type ReservationsContextValue,
} from "@/src/components/dashboard/reservations/context/reservations-context";
import { useReservationsView } from "@/src/components/dashboard/reservations/hooks/use-reservations-view";
import type {
  DayStatusFilter,
  DayZoneFilter,
  ReservationRow,
  ReservationStatus,
  ReservationsPageProps,
  SeatingZone,
} from "@/src/components/dashboard/reservations/types";
import {
  addCalendarDaysYmd,
  filterDayReservations,
  filterUpcomingReservations,
  seatingZoneFromRow,
} from "@/src/components/dashboard/reservations/utils/reservation-filters";
import { sortReservations } from "@/src/components/dashboard/reservations/utils/reservation-sort";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";
import { createClient } from "@/src/lib/supabase/client";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type ReservationsProviderProps = ReservationsPageProps & {
  children: ReactNode;
};

export function ReservationsProvider({
  initialReservations,
  initialShowManualForm = false,
  terraceEnabled = false,
  showZoneUi = false,
  terraceLabel = "Terrasse",
  autoArchiveReservations = false,
  reservationDurationMinutes = 90,
  restaurantCapacity = 40,
  openingHours = null,
  children,
}: ReservationsProviderProps) {
  const supabase = createClient();
  const showToast = useDashboardToast();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const { viewMode, setViewMode } = useReservationsView();

  const [reservations, setReservations] = useState(() => sortReservations(initialReservations));
  const [daySectionDate, setDaySectionDate] = useState(() => calendarYmdInBusinessTz());
  const [daySectionStatus, setDaySectionStatus] = useState<DayStatusFilter>("all");
  const [dayZoneFilter, setDayZoneFilter] = useState<DayZoneFilter>("all");
  const [manualForceOverbook, setManualForceOverbook] = useState(false);
  const [manualOverbookWarning, setManualOverbookWarning] = useState<string | null>(null);
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
  const [manualZone, setManualZone] = useState<SeatingZone>("interior");
  const [manualNote, setManualNote] = useState("");
  const [manualWalkInMode, setManualWalkInMode] = useState(false);
  const [showWalkInContactFields, setShowWalkInContactFields] = useState(false);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initialReservations.map((reservation) => [reservation.id, reservation.internal_note ?? ""]),
    ),
  );

  const zoneLabelTerrace = terraceLabel.trim() || "Terrasse";

  useEffect(() => {
    if (!highlightId) return;
    const match = reservations.find((r) => r.id === highlightId);
    if (!match) return;
    setDaySectionDate(match.reservation_date);
    setSelectedReservationId(match.id);
  }, [highlightId, reservations]);

  const dayZoneOptions = useMemo(
    (): { value: DayZoneFilter; label: string }[] => [
      { value: "all", label: "Toutes" },
      { value: "interior", label: "Salle" },
      { value: "terrace", label: zoneLabelTerrace },
    ],
    [zoneLabelTerrace],
  );

  const todayRows = useMemo(
    () =>
      filterDayReservations(
        reservations,
        daySectionDate,
        daySectionStatus,
        showZoneUi,
        dayZoneFilter,
      ),
    [reservations, daySectionDate, daySectionStatus, showZoneUi, dayZoneFilter],
  );

  const upcomingRows = useMemo(
    () => filterUpcomingReservations(reservations, upcomingRangeStart, upcomingRangeEnd),
    [reservations, upcomingRangeStart, upcomingRangeEnd],
  );

  const isDayFilterToday = daySectionDate === calendarYmdInBusinessTz();

  const selectedReservation = useMemo(() => {
    if (!selectedReservationId) return null;
    return reservations.find((r) => r.id === selectedReservationId) ?? null;
  }, [reservations, selectedReservationId]);

  const detailStatusOptions: readonly ReservationStatus[] = useMemo(() => {
    if (!autoArchiveReservations) return EDITABLE_STATUSES;
    if (selectedReservation?.status === "completed") {
      return [...STATUSES_WITHOUT_COMPLETED, "completed"];
    }
    return STATUSES_WITHOUT_COMPLETED;
  }, [autoArchiveReservations, selectedReservation?.status]);

  async function updateStatus(
    id: string,
    status: ReservationStatus,
    options?: { successMessage?: string },
  ): Promise<boolean> {
    setMessage(null);

    const previous = reservations.find((item) => item.id === id);
    if (!previous) return false;

    const previousStatus = previous.status;
    setReservations((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item)),
    );
    setSavingId(id);

    const response = await fetch(`/api/reservations/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setReservations((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: previousStatus } : item,
        ),
      );
      const errorMessage = payload.error ?? "Impossible de mettre à jour le statut.";
      setMessage(errorMessage);
      showToast({ message: errorMessage, icon: AlertCircle });
      setSavingId(null);
      return false;
    }

    const successMessage = options?.successMessage ?? "Statut mis à jour.";
    setMessage(successMessage);
    showToast({ message: successMessage, icon: CheckCircle2 });
    setSavingId(null);
    return true;
  }

  async function saveNote(id: string) {
    setMessage(null);
    setSavingId(id);

    const internal_note = noteDrafts[id] ?? "";
    const { data, error } = await supabase
      .from("reservations")
      .update({ internal_note })
      .eq("id", id)
      .select(RESERVATION_SELECT_COLUMNS)
      .single();

    if (error || !data) {
      setMessage(error?.message ?? "Impossible d'enregistrer la note.");
      setSavingId(null);
      return;
    }

    setReservations((current) =>
      current.map((item) => (item.id === id ? { ...item, ...data } : item)),
    );
    setMessage("Note enregistrée.");
    setSavingId(null);
  }

  async function createManualReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setManualOverbookWarning(null);
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
        ...(showZoneUi || terraceEnabled ? { zone: manualZone } : {}),
        ...(manualForceOverbook ? { forceOverbook: true } : {}),
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      canForceOverbook?: boolean;
      reservation?: ReservationRow;
    };
    if (!response.ok || !payload.reservation) {
      if (response.status === 409 && payload.code === "SLOT_UNAVAILABLE" && payload.canForceOverbook) {
        setManualOverbookWarning(
          payload.error ??
            "Ce créneau est complet pour la zone choisie. Vous pouvez forcer la réservation (surcharge manuelle).",
        );
        setSavingId(null);
        return;
      }
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
    setManualZone("interior");
    setManualNote("");
    setManualWalkInMode(false);
    setShowWalkInContactFields(false);
    setManualForceOverbook(false);
    setManualOverbookWarning(null);
    setMessage(
      createdReservation.reservation_type === "walkin" ? "Walk-in ajouté." : "Réservation ajoutée.",
    );
    setSavingId(null);
  }

  const value: ReservationsContextValue = {
    terraceEnabled,
    showZoneUi,
    zoneLabelTerrace,
    autoArchiveReservations,
    reservationDurationMinutes,
    restaurantCapacity,
    openingHours,
    viewMode,
    setViewMode,
    reservations,
    setReservations,
    daySectionDate,
    setDaySectionDate,
    daySectionStatus,
    setDaySectionStatus,
    dayZoneFilter,
    setDayZoneFilter,
    upcomingRangeStart,
    setUpcomingRangeStart,
    upcomingRangeEnd,
    setUpcomingRangeEnd,
    savingId,
    message,
    setMessage,
    selectedReservationId,
    setSelectedReservationId,
    showManualForm,
    setShowManualForm,
    noteDrafts,
    setNoteDrafts,
    dayZoneOptions,
    todayRows,
    upcomingRows,
    isDayFilterToday,
    selectedReservation,
    detailStatusOptions,
    seatingZoneFromRow,
    updateStatus,
    saveNote,
    createManualReservation,
    manualGuestName,
    setManualGuestName,
    manualGuestPhone,
    setManualGuestPhone,
    manualGuestEmail,
    setManualGuestEmail,
    manualReservationDate,
    setManualReservationDate,
    manualReservationTime,
    setManualReservationTime,
    manualGuests,
    setManualGuests,
    manualZone,
    setManualZone,
    manualNote,
    setManualNote,
    manualWalkInMode,
    setManualWalkInMode,
    showWalkInContactFields,
    setShowWalkInContactFields,
    manualForceOverbook,
    setManualForceOverbook,
    manualOverbookWarning,
    setManualOverbookWarning,
  };

  return <ReservationsContext.Provider value={value}>{children}</ReservationsContext.Provider>;
}
