"use client";

import ReservationListRow from "@/src/components/dashboard/reservations/list-row/reservation-list-row";
import type { ReservationListRowActionHandlers } from "@/src/components/dashboard/reservations/list-row/reservation-list-row-actions";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
import type { ServiceGroup } from "@/src/components/dashboard/reservations/utils/reservation-grouping";
import Button from "@/src/components/ui/button";
import { Moon, Sun } from "lucide-react";

type ReservationListServiceSectionProps = {
  section: ServiceGroup;
  terraceLabel: string;
  seatingZoneFromRow: (row: ReservationRow) => "interior" | "terrace";
  savingId: string | null;
  isViewingToday: boolean;
  buildHandlers: (reservation: ReservationRow) => ReservationListRowActionHandlers;
  onOpenDetail: (reservation: ReservationRow) => void;
  onAddReservation: () => void;
};

export default function ReservationListServiceSection({
  section,
  terraceLabel,
  seatingZoneFromRow,
  savingId,
  isViewingToday,
  buildHandlers,
  onOpenDetail,
  onAddReservation,
}: ReservationListServiceSectionProps) {
  const Icon = section.key === "lunch" ? Sun : Moon;
  const headerLabel = section.key === "lunch" ? "Service midi" : "Service soir";
  const reservationWord =
    section.reservationCount === 1 ? "réservation" : "réservations";
  const coverWord = section.coverCount === 1 ? "couvert" : "couverts";

  return (
    <section aria-labelledby={`service-${section.key}`}>
      <header
        id={`service-${section.key}`}
        className="flex flex-wrap items-center justify-between gap-3 rounded-t-xl border border-b-0 border-zg-border bg-zg-surface-elevated px-4 py-3 sm:px-5"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <Icon className="h-4 w-4 shrink-0 text-zg-accent" aria-hidden />
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-zg-fg">
            {headerLabel}
          </h2>
        </div>
        <p className="text-xs font-medium text-zg-text-muted tabular-nums">
          {section.reservationCount} {reservationWord} · {section.coverCount} {coverWord}
        </p>
      </header>

      <div className="rounded-b-xl border border-zg-border bg-zg-surface/40 p-3 sm:p-4">
        {section.rows.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-4 py-10 text-center">
            <p className="text-sm text-zg-text-muted">Aucune réservation pour ce service</p>
            <Button type="button" variant="secondary" size="sm" onClick={onAddReservation}>
              Ajouter une réservation
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {section.rows.map((reservation) => (
              <li key={reservation.id}>
                <ReservationListRow
                  reservation={reservation}
                  zone={seatingZoneFromRow(reservation)}
                  terraceLabel={terraceLabel}
                  actionHandlers={buildHandlers(reservation)}
                  isViewingToday={isViewingToday}
                  saving={savingId === reservation.id}
                  onOpenDetail={() => onOpenDetail(reservation)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
