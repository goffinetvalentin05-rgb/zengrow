"use client";

import { useSyncExternalStore } from "react";
import ReservationsKpiCards from "@/src/components/dashboard/reservations/header/reservations-kpi-cards";
import ReservationsKpiSkeleton from "@/src/components/dashboard/reservations/header/reservations-kpi-skeleton";

function subscribeHydrated(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const id = requestAnimationFrame(() => cb());
  return () => cancelAnimationFrame(id);
}

function getHydrated() {
  return typeof window !== "undefined";
}

export default function ReservationsHeader() {
  const hydrated = useSyncExternalStore(subscribeHydrated, getHydrated, () => false);

  return (
    <header aria-labelledby="reservations-kpi-heading">
      <h2 id="reservations-kpi-heading" className="sr-only">
        Indicateurs du service
      </h2>
      {hydrated ? <ReservationsKpiCards /> : <ReservationsKpiSkeleton />}
    </header>
  );
}
