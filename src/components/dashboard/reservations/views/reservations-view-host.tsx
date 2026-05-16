"use client";

import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import ReservationsListView from "@/src/components/dashboard/reservations/views/list/reservations-list-view";
import ReservationsTimelineView from "@/src/components/dashboard/reservations/views/timeline/reservations-timeline-view";

export default function ReservationsViewHost() {
  const { viewMode } = useReservations();

  if (viewMode === "timeline") {
    return <ReservationsTimelineView />;
  }

  return <ReservationsListView />;
}
