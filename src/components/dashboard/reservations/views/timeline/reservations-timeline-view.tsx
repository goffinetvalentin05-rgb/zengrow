"use client";

import { useMemo } from "react";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import TimelineServiceRow from "@/src/components/dashboard/reservations/views/timeline/timeline-service-row";
import { formatYmdLongFr } from "@/src/components/dashboard/reservations/utils/reservation-date-format";
import { computeTimelineLayout } from "@/src/components/dashboard/reservations/utils/reservation-timeline";
import { Card, CardContent } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import { AlertTriangle, Timer } from "lucide-react";

export default function ReservationsTimelineView() {
  const {
    todayRows,
    daySectionDate,
    openingHours,
    reservationDurationMinutes,
    restaurantCapacity,
    selectedReservationId,
    setSelectedReservationId,
  } = useReservations();

  const layout = useMemo(
    () =>
      computeTimelineLayout({
        rows: todayRows,
        ymd: daySectionDate,
        openingHours,
        durationMinutes: reservationDurationMinutes,
        restaurantCapacity,
      }),
    [todayRows, daySectionDate, openingHours, reservationDurationMinutes, restaurantCapacity],
  );

  const hasAnyBlock = layout.rows.some((r) => r.blocks.length > 0);
  const activeServices = layout.rows.filter((r) => r.active).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-zg-fg">Timeline du service</h2>
        <p className="mt-1 text-sm text-zg-text-muted">
          {formatYmdLongFr(daySectionDate)} · durée repas {reservationDurationMinutes} min
        </p>
      </div>

      {layout.hasOverload ? (
        <div
          className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100"
          role="status"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden />
          <p>
            <span className="font-semibold">Trop occupé</span> — la capacité ({restaurantCapacity}{" "}
            couverts) est dépassée sur certains créneaux.
          </p>
        </div>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          {activeServices === 0 ? (
            <EmptyState
              icon={Timer}
              title="Restaurant fermé"
              description="Aucune plage d'ouverture ce jour pour afficher la timeline."
            />
          ) : !hasAnyBlock ? (
            <EmptyState
              icon={Timer}
              title="Timeline vide"
              description="Aucune réservation à placer sur ce jour avec les filtres actuels."
            />
          ) : (
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[640px] space-y-6">
                {layout.rows.map((row) => (
                  <TimelineServiceRow
                    key={row.key}
                    row={row}
                    selectedReservationId={selectedReservationId}
                    onSelectReservation={setSelectedReservationId}
                    showNowMarker={layout.isToday}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
