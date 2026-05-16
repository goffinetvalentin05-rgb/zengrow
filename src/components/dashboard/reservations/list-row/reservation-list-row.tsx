"use client";

import { memo } from "react";
import ReservationListRowActions, {
  type ReservationListRowActionHandlers,
} from "@/src/components/dashboard/reservations/list-row/reservation-list-row-actions";
import ReservationListRowStatus from "@/src/components/dashboard/reservations/list-row/reservation-list-row-status";
import ReservationsGuestAvatar from "@/src/components/dashboard/reservations/list-row/reservations-guest-avatar";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
import { buildReservationRowMetadata } from "@/src/components/dashboard/reservations/utils/reservation-list-metadata";
import type { SeatingZone } from "@/src/components/dashboard/reservations/types";
import { cn } from "@/src/lib/utils";
import { ChevronRight } from "lucide-react";

type ReservationListRowProps = {
  reservation: ReservationRow;
  zone: SeatingZone;
  terraceLabel: string;
  isViewingToday: boolean;
  actionHandlers: ReservationListRowActionHandlers;
  saving?: boolean;
  onOpenDetail: () => void;
};

function ReservationListRow({
  reservation,
  zone,
  terraceLabel,
  isViewingToday,
  actionHandlers,
  saving = false,
  onOpenDetail,
}: ReservationListRowProps) {
  const timeLabel = reservation.reservation_time.trim().slice(0, 5);
  const isCancelled = reservation.status === "cancelled";
  const metadata = buildReservationRowMetadata(reservation, zone, terraceLabel);

  return (
    <article
      className={cn(
        "group relative rounded-xl border border-zg-border bg-zg-surface transition-colors duration-150",
        "[content-visibility:auto] [contain-intrinsic-size:auto_5.5rem]",
        "hover:border-zg-border-hover hover:bg-zg-accent/[0.05] md:hover:bg-zg-card-hover",
        "focus-within:border-zg-border-hover focus-within:bg-zg-card-hover",
        isCancelled && "opacity-70",
      )}
    >
      <button
        type="button"
        disabled={saving}
        onClick={onOpenDetail}
        className={cn(
          "grid w-full grid-cols-[auto_auto_minmax(0,1fr)_auto_auto] items-center gap-3 px-4 py-3.5 text-left sm:grid-cols-[auto_auto_minmax(0,1fr)_auto_auto_auto_auto] sm:gap-4 sm:px-5",
          isCancelled && "[&_.reservation-guest-name]:line-through",
        )}
      >
        <span
          className={cn(
            "w-[3.25rem] shrink-0 text-xl font-medium tabular-nums leading-none sm:w-14 sm:text-2xl",
            isViewingToday ? "text-zg-accent" : "text-zg-fg",
          )}
        >
          {timeLabel}
        </span>

        <ReservationsGuestAvatar name={reservation.guest_name} size="md" variant="solid" />

        <span className="min-w-0">
          <span className="reservation-guest-name block truncate text-base font-semibold text-zg-fg">
            {reservation.guest_name}
          </span>
          <span className="mt-0.5 block truncate text-sm text-zg-text-muted">{metadata}</span>
        </span>

        <span className="w-[4.5rem] shrink-0 text-right text-sm text-zg-text-muted sm:w-16">
          <span className="font-medium text-zg-fg tabular-nums">{reservation.guests}</span> pers
        </span>

        <ReservationListRowStatus status={reservation.status} className="hidden sm:flex" />

        <span className="hidden sm:block">
          <ReservationListRowActions
            reservation={reservation}
            handlers={actionHandlers}
            disabled={saving}
          />
        </span>

        <ChevronRight
          className="hidden h-5 w-5 shrink-0 text-zg-text-muted sm:block"
          strokeWidth={2}
          aria-hidden
        />
      </button>

      <div className="flex items-center justify-between gap-2 border-t border-zg-border/60 px-4 py-2 sm:hidden">
        <ReservationListRowStatus status={reservation.status} />
        <ReservationListRowActions
          reservation={reservation}
          handlers={actionHandlers}
          disabled={saving}
        />
      </div>
    </article>
  );
}

export default memo(ReservationListRow);
