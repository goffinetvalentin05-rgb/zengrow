"use client";

import { useEffect, useRef } from "react";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";

const DEBOUNCE_MS = 1000;

/** Sauvegarde automatique de la note interne pendant l’édition dans le modal. */
export function useReservationDetailNote(reservationId: string | null) {
  const { noteDrafts, saveNote } = useReservations();
  const note = reservationId ? (noteDrafts[reservationId] ?? "") : "";
  const skipNextSave = useRef(true);
  const reservationIdRef = useRef(reservationId);

  useEffect(() => {
    if (reservationIdRef.current !== reservationId) {
      reservationIdRef.current = reservationId;
      skipNextSave.current = true;
    }
  }, [reservationId]);

  useEffect(() => {
    if (!reservationId) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void saveNote(reservationId);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [note, reservationId, saveNote]);

  return note;
}
