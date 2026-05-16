"use client";

import { createContext, type Dispatch, type FormEvent, type SetStateAction } from "react";
import type {
  DayStatusFilter,
  DayZoneFilter,
  ReservationRow,
  ReservationStatus,
  ReservationViewMode,
  SeatingZone,
} from "@/src/components/dashboard/reservations/types";
import type { OpeningHours } from "@/src/lib/utils";

export type ReservationsContextValue = {
  terraceEnabled: boolean;
  showZoneUi: boolean;
  zoneLabelTerrace: string;
  autoArchiveReservations: boolean;
  reservationDurationMinutes: number;
  restaurantCapacity: number;
  openingHours: OpeningHours | null;
  viewMode: ReservationViewMode;
  setViewMode: (mode: ReservationViewMode) => void;
  reservations: ReservationRow[];
  setReservations: Dispatch<SetStateAction<ReservationRow[]>>;
  daySectionDate: string;
  setDaySectionDate: (ymd: string) => void;
  daySectionStatus: DayStatusFilter;
  setDaySectionStatus: (filter: DayStatusFilter) => void;
  dayZoneFilter: DayZoneFilter;
  setDayZoneFilter: (filter: DayZoneFilter) => void;
  savingId: string | null;
  message: string | null;
  setMessage: (message: string | null) => void;
  selectedReservationId: string | null;
  setSelectedReservationId: (id: string | null) => void;
  showManualForm: boolean;
  setShowManualForm: Dispatch<SetStateAction<boolean>>;
  noteDrafts: Record<string, string>;
  setNoteDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  dayZoneOptions: { value: DayZoneFilter; label: string }[];
  todayRows: ReservationRow[];
  upcomingRows: ReservationRow[];
  isDayFilterToday: boolean;
  selectedReservation: ReservationRow | null;
  detailStatusOptions: readonly ReservationStatus[];
  seatingZoneFromRow: (row: ReservationRow) => SeatingZone;
  updateStatus: (
    id: string,
    status: ReservationStatus,
    options?: { successMessage?: string },
  ) => Promise<boolean>;
  saveNote: (id: string) => Promise<void>;
  createManualReservation: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  manualGuestName: string;
  setManualGuestName: (value: string) => void;
  manualGuestPhone: string;
  setManualGuestPhone: (value: string) => void;
  manualGuestEmail: string;
  setManualGuestEmail: (value: string) => void;
  manualReservationDate: string;
  setManualReservationDate: (value: string) => void;
  manualReservationTime: string;
  setManualReservationTime: (value: string) => void;
  manualGuests: number;
  setManualGuests: (value: number) => void;
  manualZone: SeatingZone;
  setManualZone: (zone: SeatingZone) => void;
  manualNote: string;
  setManualNote: (value: string) => void;
  manualWalkInMode: boolean;
  setManualWalkInMode: (value: boolean) => void;
  showWalkInContactFields: boolean;
  setShowWalkInContactFields: (value: boolean) => void;
  manualForceOverbook: boolean;
  setManualForceOverbook: (value: boolean) => void;
  manualOverbookWarning: string | null;
  setManualOverbookWarning: (value: string | null) => void;
};

export const ReservationsContext = createContext<ReservationsContextValue | null>(null);
