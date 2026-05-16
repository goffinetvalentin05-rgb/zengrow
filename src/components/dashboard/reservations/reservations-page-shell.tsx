"use client";

import ReservationsDetailPanel from "@/src/components/dashboard/reservations/detail/reservations-detail-panel";
import ReservationsViewHost from "@/src/components/dashboard/reservations/views/reservations-view-host";

export default function ReservationsPageShell() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
      <ReservationsViewHost />
      <ReservationsDetailPanel />
    </div>
  );
}
