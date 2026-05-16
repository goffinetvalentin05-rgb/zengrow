"use client";

import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import ReservationsUpcomingList from "@/src/components/dashboard/reservations/views/list/reservations-upcoming-list";
import FilterBar from "@/src/components/dashboard/ui/filter-bar";
import { Card, CardContent } from "@/src/components/ui/card";
import EmptyState from "@/src/components/ui/empty-state";
import Input from "@/src/components/ui/input";
import { Calendar } from "lucide-react";

export default function ReservationsUpcomingSection() {
  const {
    upcomingRangeStart,
    setUpcomingRangeStart,
    upcomingRangeEnd,
    setUpcomingRangeEnd,
    upcomingRows,
  } = useReservations();

  return (
    <div>
      <div className="mb-3">
        <h2 className="text-base font-semibold text-zg-fg">À venir</h2>
        <p className="mt-1 text-sm text-zg-text-muted">
          Prochains jours (7 jours par défaut), groupés par date.
        </p>
      </div>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <FilterBar right={null}>
            <div className="w-[170px]">
              <label className="dashboard-field-label">Du</label>
              <Input
                type="date"
                value={upcomingRangeStart}
                onChange={(e) => setUpcomingRangeStart(e.target.value)}
              />
            </div>
            <div className="w-[170px]">
              <label className="dashboard-field-label">Au</label>
              <Input
                type="date"
                value={upcomingRangeEnd}
                onChange={(e) => setUpcomingRangeEnd(e.target.value)}
              />
            </div>
          </FilterBar>

          {upcomingRows.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Pas de réservations à venir"
              description="Tu n&apos;as pas encore de réservations à venir."
            />
          ) : (
            <ReservationsUpcomingList rows={upcomingRows} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
