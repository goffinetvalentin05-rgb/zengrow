"use client";

import ReservationsKpiCard from "@/src/components/dashboard/reservations/header/reservations-kpi-card";
import { useReservationsKpi } from "@/src/components/dashboard/reservations/hooks/use-reservations-kpi";
import { AlertTriangle, Clock, TrendingUp, Users } from "lucide-react";

const EMPTY = "—";

export default function ReservationsKpiCards() {
  const { covers, coversSubline, fill, nextArrival, weekNoShow } = useReservationsKpi();

  const fillProgressTone =
    fill.fillPercent >= 95 ? "danger" : fill.fillPercent >= 70 ? "warning" : "accent";

  const noShowDataTone =
    weekNoShow.ratePercent > 5 ? "danger" : weekNoShow.ratePercent > 0 ? "warning" : "accent";

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
        label="Prochaine arrivée"
        value={nextArrival ? nextArrival.timeLabel : EMPTY}
        subline={
          nextArrival
            ? `${nextArrival.guestName} · Dans ${nextArrival.minutesUntil} min · ${nextArrival.guests} pers`
            : "Aucune arrivée prévue"
        }
        icon={Clock}
        dataTone="info"
      />
      <ReservationsKpiCard
        label="No-shows cette semaine"
        value={weekNoShow.noShowCount}
        subline={`Sur ${weekNoShow.totalReservations} réservations · taux ${weekNoShow.ratePercent}%`}
        icon={AlertTriangle}
        dataTone={noShowDataTone}
      />
    </div>
  );
}
