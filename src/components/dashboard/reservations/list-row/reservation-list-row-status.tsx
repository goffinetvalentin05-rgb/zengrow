"use client";

import { STATUS_LABEL_FR } from "@/src/components/dashboard/reservations/constants";
import type { ReservationStatus } from "@/src/components/dashboard/reservations/types";
import { cn } from "@/src/lib/utils";

const STATUS_DOT: Record<
  ReservationStatus,
  { dotClass: string; label: string }
> = {
  confirmed: { dotClass: "bg-zg-success", label: STATUS_LABEL_FR.confirmed },
  pending: { dotClass: "bg-zg-warning", label: STATUS_LABEL_FR.pending },
  cancelled: { dotClass: "bg-zg-text-muted", label: STATUS_LABEL_FR.cancelled },
  refused: { dotClass: "bg-zg-text-muted", label: STATUS_LABEL_FR.refused },
  completed: { dotClass: "bg-zg-info", label: STATUS_LABEL_FR.completed },
  "no-show": { dotClass: "bg-zg-danger", label: STATUS_LABEL_FR["no-show"] },
};

type ReservationListRowStatusProps = {
  status: ReservationStatus;
  className?: string;
};

export default function ReservationListRowStatus({ status, className }: ReservationListRowStatusProps) {
  const { dotClass, label } = STATUS_DOT[status];

  return (
    <span
      className={cn("flex h-8 w-8 shrink-0 items-center justify-center", className)}
      title={label}
    >
      <span
        className={cn("h-2.5 w-2.5 rounded-full", dotClass)}
        role="img"
        aria-label={label}
      />
    </span>
  );
}
