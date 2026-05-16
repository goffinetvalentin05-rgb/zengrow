"use client";

import { useCallback, useEffect, useState } from "react";
import { RESERVATIONS_VIEW_STORAGE_KEY } from "@/src/components/dashboard/reservations/constants";
import type { ReservationViewMode } from "@/src/components/dashboard/reservations/types";

function readStoredViewMode(): ReservationViewMode {
  if (typeof window === "undefined") return "list";
  try {
    const raw = localStorage.getItem(RESERVATIONS_VIEW_STORAGE_KEY);
    if (raw === "timeline" || raw === "list") return raw;
    if (raw === "calendar") return "list";
  } catch {
    /* ignore */
  }
  return "list";
}

export function useReservationsView() {
  const [viewMode, setViewModeState] = useState<ReservationViewMode>("list");

  useEffect(() => {
    setViewModeState(readStoredViewMode());
  }, []);

  const setViewMode = useCallback((mode: ReservationViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(RESERVATIONS_VIEW_STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.key === "1") setViewMode("list");
      if (event.key === "2") setViewMode("timeline");
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setViewMode]);

  return { viewMode, setViewMode };
}
