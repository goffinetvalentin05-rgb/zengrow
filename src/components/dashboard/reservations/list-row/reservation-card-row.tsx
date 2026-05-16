"use client";

import { useMemo } from "react";
import { historyStatusDisplayLabel } from "@/src/components/dashboard/reservations/constants";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import ReservationQuickActions, {
  type ReservationQuickActionHandlers,
} from "@/src/components/dashboard/reservations/list-row/reservation-quick-actions";
import ReservationsGuestAvatar from "@/src/components/dashboard/reservations/list-row/reservations-guest-avatar";
import type { ReservationRow } from "@/src/components/dashboard/reservations/types";
import StatusBadge from "@/src/components/dashboard/status-badge";
import { zoneDisplayLabel } from "@/src/lib/reservation/terrace-settings";
import { cn } from "@/src/lib/utils";

type ReservationCardRowProps = {
  reservation: ReservationRow;
  actionHandlers: ReservationQuickActionHandlers;
  showDate?: boolean;
  className?: string;
};

export default function ReservationCardRow({
  reservation,
  actionHandlers,
  showDate = false,
  className,
}: ReservationCardRowProps) {
  const {
    selectedReservationId,
    setSelectedReservationId,
    showZoneUi,
    zoneLabelTerrace,
    autoArchiveReservations,
    seatingZoneFromRow,
    savingId,
  } = useReservations();

  const isSelected = selectedReservationId === reservation.id;
  const timeLabel = reservation.reservation_time.trim().slice(0, 5);
  const zone = seatingZoneFromRow(reservation);
  const zoneLabel = zoneDisplayLabel(zone, zoneLabelTerrace);
  const isWalkIn = reservation.reservation_type === "walkin";
  const statusLabel = historyStatusDisplayLabel(reservation, autoArchiveReservations);

  const datePrefix = useMemo(() => {
    if (!showDate) return null;
    return reservation.reservation_date;
  }, [showDate, reservation.reservation_date]);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => setSelectedReservationId(reservation.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setSelectedReservationId(reservation.id);
        }
      }}
      className={cn(
        "group relative flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-zg-border bg-zg-surface p-4 text-left transition-all duration-200 ease-out sm:gap-4 sm:p-4",
        "hover:border-zg-border-hover hover:bg-zg-card-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/40",
        isSelected && "border-zg-accent/45 bg-zg-accent-soft-bg ring-1 ring-zg-accent/25",
        className,
      )}
    >
      <div className="w-[52px] shrink-0 sm:w-14">
        {datePrefix ? (
          <p className="text-[10px] font-medium uppercase tracking-wide text-zg-text-muted">
            {datePrefix}
          </p>
        ) : null}
        <p className="text-xl font-bold tabular-nums leading-none text-zg-teal sm:text-2xl">{timeLabel}</p>
      </div>

      <ReservationsGuestAvatar name={reservation.guest_name} size="md" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-zg-fg">{reservation.guest_name}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zg-muted">
          <span className="font-medium tabular-nums">{reservation.guests} pers.</span>
          {showZoneUi ? (
            <span className="rounded-full border border-zg-border-accent bg-zg-surface-soft/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zg-teal">
              {zoneLabel}
            </span>
          ) : null}
          {isWalkIn ? (
            <span className="rounded-full border border-zg-warning/35 bg-zg-warning-soft-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zg-warning">
              Walk-in
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3">
        <StatusBadge status={reservation.status} displayLabel={statusLabel} />
        <ReservationQuickActions
          reservation={reservation}
          handlers={actionHandlers}
          disabled={savingId === reservation.id}
        />
      </div>
    </article>
  );
}
