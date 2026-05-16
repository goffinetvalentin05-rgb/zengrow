"use client";

import { useReservationsSlotStats } from "@/src/components/dashboard/reservations/hooks/use-reservations-slot-stats";
import ReservationsPeriodStats from "@/src/components/dashboard/reservations/stats/reservations-period-stats";
import ReservationsServiceStatsCard from "@/src/components/dashboard/reservations/stats/reservations-service-stats-card";
import { formatYmdLongFr } from "@/src/components/dashboard/reservations/utils/reservation-date-format";
import { Moon, Sun } from "lucide-react";

export default function ReservationsStatsPanel() {
  const {
    isToday,
    daySectionDate,
    dayServices,
    periodTotals,
    showDayServiceCards,
    periodRangeLabel,
  } = useReservationsSlotStats();

  if (!showDayServiceCards) {
    return (
      <section aria-labelledby="reservations-period-stats-heading">
        <h2 id="reservations-period-stats-heading" className="sr-only">
          Statistiques de la période
        </h2>
        <ReservationsPeriodStats totals={periodTotals} rangeLabel={periodRangeLabel} />
      </section>
    );
  }

  return (
    <section aria-labelledby="reservations-slot-stats-heading">
      <h2 id="reservations-slot-stats-heading" className="sr-only">
        Statistiques par créneau
      </h2>
      {!isToday ? (
        <p className="mb-3 text-sm text-zg-text-muted">
          Créneaux pour le <span className="font-medium text-zg-fg">{formatYmdLongFr(daySectionDate)}</span>
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReservationsServiceStatsCard
          stats={dayServices.lunch}
          icon={Sun}
          iconToneClass="bg-zg-warning-soft-bg text-zg-warning"
        />
        <ReservationsServiceStatsCard
          stats={dayServices.dinner}
          icon={Moon}
          iconToneClass="bg-zg-premium-soft-bg text-zg-premium"
        />
      </div>
    </section>
  );
}
