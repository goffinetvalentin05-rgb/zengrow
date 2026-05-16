"use client";

import ReservationsHeader from "@/src/components/dashboard/reservations/header/reservations-header";
import ReservationsManualForm from "@/src/components/dashboard/reservations/manual-form/reservations-manual-form";
import { ReservationsProvider } from "@/src/components/dashboard/reservations/context/reservations-provider";
import ReservationsPageShell from "@/src/components/dashboard/reservations/reservations-page-shell";
import ReservationsStatsPanel from "@/src/components/dashboard/reservations/stats/reservations-stats-panel";
import ReservationsToolbar from "@/src/components/dashboard/reservations/toolbar/reservations-toolbar";
import type { ReservationsPageProps } from "@/src/components/dashboard/reservations/types";

export default function ReservationsPage(props: ReservationsPageProps) {
  return (
    <ReservationsProvider {...props}>
      <section className="space-y-10 md:space-y-12">
        <ReservationsHeader />
        <ReservationsToolbar />
        <ReservationsStatsPanel />
        <ReservationsManualForm />
        <ReservationsPageShell />
      </section>
    </ReservationsProvider>
  );
}
