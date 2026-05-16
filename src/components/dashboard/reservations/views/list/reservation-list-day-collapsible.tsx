"use client";

import { useId, useState } from "react";
import ReservationListServiceSection from "@/src/components/dashboard/reservations/views/list/reservation-list-service-section";
import type { ReservationListRowActionHandlers } from "@/src/components/dashboard/reservations/list-row/reservation-list-row-actions";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
import { buildListServiceSections } from "@/src/components/dashboard/reservations/utils/reservation-grouping";
import { formatYmdHeadingFr } from "@/src/components/dashboard/reservations/utils/reservation-date-format";
import type { OpeningHours } from "@/src/lib/utils";
import { cn } from "@/src/lib/utils";
import { ChevronDown } from "lucide-react";

type ReservationListDayCollapsibleProps = {
  date: string;
  rows: ReservationRow[];
  reservationCount: number;
  coverCount: number;
  openingHours: OpeningHours | null;
  terraceLabel: string;
  seatingZoneFromRow: (row: ReservationRow) => "interior" | "terrace";
  savingId: string | null;
  defaultOpen?: boolean;
  buildHandlers: (reservation: ReservationRow) => ReservationListRowActionHandlers;
  onOpenDetail: (reservation: ReservationRow) => void;
  onAddReservation: () => void;
};

export default function ReservationListDayCollapsible({
  date,
  rows,
  reservationCount,
  coverCount,
  openingHours,
  terraceLabel,
  seatingZoneFromRow,
  savingId,
  defaultOpen = false,
  buildHandlers,
  onOpenDetail,
  onAddReservation,
}: ReservationListDayCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const sections = buildListServiceSections(rows, date, openingHours);

  const reservationWord = reservationCount === 1 ? "résa" : "résas";
  const coverWord = coverCount === 1 ? "couvert" : "couverts";

  return (
    <article className="overflow-hidden rounded-xl border border-zg-border bg-zg-surface/30">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors duration-150 sm:px-5",
          "hover:bg-zg-card-hover",
        )}
      >
        <span className="min-w-0 text-sm font-semibold text-zg-fg">{formatYmdHeadingFr(date)}</span>
        <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-zg-text-muted tabular-nums">
          <span>
            {reservationCount} {reservationWord} · {coverCount} {coverWord}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-zg-text-muted transition-transform duration-150",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </span>
      </button>

      {open ? (
        <div
          id={panelId}
          className="space-y-4 border-t border-zg-border px-3 py-4 sm:px-4"
        >
          {sections.map((section) => (
            <ReservationListServiceSection
              key={`${date}-${section.key}`}
              section={section}
              terraceLabel={terraceLabel}
              seatingZoneFromRow={seatingZoneFromRow}
              savingId={savingId}
              isViewingToday={false}
              buildHandlers={buildHandlers}
              onOpenDetail={onOpenDetail}
              onAddReservation={onAddReservation}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}
