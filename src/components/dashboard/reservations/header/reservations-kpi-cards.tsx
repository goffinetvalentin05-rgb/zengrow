"use client";

import ReservationsKpiCard from "@/src/components/dashboard/reservations/header/reservations-kpi-card";
import { useReservationsKpi } from "@/src/components/dashboard/reservations/hooks/use-reservations-kpi";
import { CalendarDays, TrendingUp, Users } from "lucide-react";

export default function ReservationsKpiCards() {
  const { covers, coversSubline, fill, week } = useReservationsKpi();

  const fillProgressTone =
    fill.fillPercent >= 95 ? "danger" : fill.fillPercent >= 70 ? "warning" : "accent";

  const weekCoversLabel =
    week.totalCovers === 1
      ? "1 couvert au total"
      : `${week.totalCovers} couverts au total`;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      <ReservationsKpiCard
        label="Couverts attendus aujourd'hui"
        value={covers.totalCovers}
        subline={coversSubline}
        icon={Users}
        dataTone="accent"
      />
      <ReservationsKpiCard
        label="Taux de remplissage du jour"
        value={`${fill.fillPercent}%`}
        subline={`${fill.expectedCovers}/${fill.maxCovers} couverts max`}
        icon={TrendingUp}
        dataTone="success"
        progressPercent={fill.fillPercent}
        progressTone={fillProgressTone}
      />
      <ReservationsKpiCard
        label="Réservations cette semaine"
        value={week.reservationCount}
        subline={weekCoversLabel}
        trend={week.trendLabel}
        trendTone={week.trendTone}
        icon={CalendarDays}
        dataTone="info"
      />
    </div>
  );
}
