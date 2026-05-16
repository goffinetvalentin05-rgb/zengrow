"use client";

import ReservationDetailCopyChip from "@/src/components/dashboard/reservations/detail/reservation-detail-copy-chip";
import { cn } from "@/src/lib/utils";
import Link from "next/link";

type CustomerContactFieldProps = {
  label: string;
  value: string;
  actionHref: string;
  actionLabel: string;
  className?: string;
};

export default function CustomerContactField({
  label,
  value,
  actionHref,
  actionLabel,
  className,
}: CustomerContactFieldProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-zg-border bg-zg-surface-elevated/60 p-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-xs font-medium text-zg-text-muted">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-zg-fg">{value}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <ReservationDetailCopyChip label={label.toLowerCase()} value={value} />
        <Link
          href={actionHref}
          className="inline-flex items-center rounded-lg border border-zg-border px-2.5 py-1 text-xs font-medium text-zg-text-secondary transition-colors hover:border-zg-border-hover hover:bg-zg-card-hover hover:text-zg-fg"
        >
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
