"use client";

import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import ReservationsCalendarView from "@/src/components/dashboard/reservations/views/calendar/reservations-calendar-view";
import ReservationsListView from "@/src/components/dashboard/reservations/views/list/reservations-list-view";
import ReservationsTimelineView from "@/src/components/dashboard/reservations/views/timeline/reservations-timeline-view";

export default function ReservationsViewHost() {
  const { viewMode } = useReservations();

  if (viewMode === "timeline") {
    return <ReservationsTimelineView />;
  }
  if (viewMode === "calendar") {
    return <ReservationsCalendarView />;
  }
  return <ReservationsListView />;
}
