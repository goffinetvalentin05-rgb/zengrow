"use client";

import ReservationsKpiCard from "@/src/components/dashboard/reservations/header/reservations-kpi-card";
import { useCustomers } from "@/src/components/dashboard/customers/context/use-customers";
import {
  formatAvgVisitsSubline,
  formatLoyalPercentSubline,
  formatNewThisMonthSubline,
} from "@/src/components/dashboard/customers/utils/customer-kpis";
import { CalendarDays, Heart, Users } from "lucide-react";

export default function CustomersKpiCards() {
  const { kpis } = useCustomers();

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
      aria-labelledby="customers-kpi-heading"
    >
      <h2 id="customers-kpi-heading" className="sr-only">
        Indicateurs clients
      </h2>
      <ReservationsKpiCard
        label="Total clients"
        value={kpis.totalClients}
        subline={formatNewThisMonthSubline(kpis.newThisMonth)}
        trend={kpis.newMonthTrend.label}
        trendTone={kpis.newMonthTrend.tone}
        icon={Users}
        dataTone="accent"
      />
      <ReservationsKpiCard
        label="Opt-in marketing"
        value={kpis.loyalClients}
        subline={formatLoyalPercentSubline(kpis.loyalPercent)}
        icon={Heart}
        dataTone="premium"
      />
      <ReservationsKpiCard
        label="Visites"
        value={kpis.totalReservations}
        subline={formatAvgVisitsSubline(kpis.avgVisitsPerClient)}
        icon={CalendarDays}
        dataTone="info"
      />
    </div>
  );
}
