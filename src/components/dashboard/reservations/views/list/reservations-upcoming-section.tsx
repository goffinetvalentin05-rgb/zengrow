"use client";

import { useMemo } from "react";
import type { UpcomingDaysRange } from "@/src/components/dashboard/reservations/constants";
import type { ReservationListRowActionHandlers } from "@/src/components/dashboard/reservations/list-row/reservation-list-row-actions";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
import ReservationListDayCollapsible from "@/src/components/dashboard/reservations/views/list/reservation-list-day-collapsible";
import { groupReservationsByDate } from "@/src/components/dashboard/reservations/utils/reservation-grouping";
import type { OpeningHours } from "@/src/lib/utils";
import { cn } from "@/src/lib/utils";

type ReservationsUpcomingSectionProps = {
  rows: ReservationRow[];
  upcomingDaysRange: UpcomingDaysRange;
  onUpcomingDaysRangeChange: (range: UpcomingDaysRange) => void;
  openingHours: OpeningHours | null;
  terraceLabel: string;
  seatingZoneFromRow: (row: ReservationRow) => "interior" | "terrace";
  savingId: string | null;
  buildHandlers: (reservation: ReservationRow) => ReservationListRowActionHandlers;
  onOpenDetail: (reservation: ReservationRow) => void;
  onAddReservation: () => void;
};

const RANGE_OPTIONS: UpcomingDaysRange[] = [7, 30];

export default function ReservationsUpcomingSection({
  rows,
  upcomingDaysRange,
  onUpcomingDaysRangeChange,
  openingHours,
  terraceLabel,
  seatingZoneFromRow,
  savingId,
  buildHandlers,
  onOpenDetail,
  onAddReservation,
}: ReservationsUpcomingSectionProps) {
  const dayGroups = useMemo(() => groupReservationsByDate(rows), [rows]);

  return (
    <section className="space-y-4" aria-labelledby="reservations-upcoming-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="reservations-upcoming-heading" className="text-base font-semibold text-zg-fg">
            À venir
          </h2>
          <p className="mt-1 text-sm text-zg-text-muted">
            Prochains {upcomingDaysRange} jours
          </p>
        </div>
        <div
          role="group"
          aria-label="Période à venir"
          className="inline-flex shrink-0 rounded-xl border border-zg-border bg-zg-surface p-1"
        >
          {RANGE_OPTIONS.map((days) => {
            const active = upcomingDaysRange === days;
            return (
              <button
                key={days}
                type="button"
                aria-pressed={active}
                onClick={() => onUpcomingDaysRangeChange(days)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-zg-accent text-white shadow-sm"
                    : "text-zg-text-muted hover:bg-zg-card-hover hover:text-zg-fg",
                )}
              >
                {days} jours
              </button>
            );
          })}
        </div>
      </div>

      {dayGroups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zg-border px-4 py-10 text-center text-sm text-zg-text-muted">
          Aucune réservation sur les {upcomingDaysRange} prochains jours.
        </p>
      ) : (
        <div className="space-y-3">
          {dayGroups.map((group, index) => (
            <ReservationListDayCollapsible
              key={group.date}
              date={group.date}
              rows={group.rows}
              reservationCount={group.reservationCount}
              coverCount={group.coverCount}
              openingHours={openingHours}
              terraceLabel={terraceLabel}
              seatingZoneFromRow={seatingZoneFromRow}
              savingId={savingId}
              defaultOpen={index === 0}
              buildHandlers={buildHandlers}
              onOpenDetail={onOpenDetail}
              onAddReservation={onAddReservation}
            />
          ))}
        </div>
      )}
    </section>
  );
}
