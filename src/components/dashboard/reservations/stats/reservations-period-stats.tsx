"use client";

import type { PeriodServiceTotals } from "@/src/components/dashboard/reservations/utils/reservation-slot-stats";
import { Moon, Sun } from "lucide-react";

type ReservationsPeriodStatsProps = {
  totals: PeriodServiceTotals;
  rangeLabel: string;
};

export default function ReservationsPeriodStats({ totals, rangeLabel }: ReservationsPeriodStatsProps) {
  return (
    <article className="rounded-2xl border border-zg-border bg-zg-surface p-5">
      <h3 className="text-sm font-semibold text-zg-fg">Stats de la période</h3>
      <p className="mt-1 text-xs text-zg-text-muted">{rangeLabel}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zg-border bg-zg-surface-elevated/50 p-4">
          <div className="flex items-center gap-2 text-zg-warning">
            <Sun className="h-4 w-4" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider">Midi</span>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zg-fg">{totals.lunchCovers}</p>
          <p className="text-xs text-zg-text-muted">
            couverts · {totals.lunchGroups} groupe{totals.lunchGroups > 1 ? "s" : ""}
          </p>
        </div>
        <div className="rounded-xl border border-zg-border bg-zg-surface-elevated/50 p-4">
          <div className="flex items-center gap-2 text-zg-premium">
            <Moon className="h-4 w-4" aria-hidden />
            <span className="text-xs font-semibold uppercase tracking-wider">Soir</span>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-zg-fg">{totals.dinnerCovers}</p>
          <p className="text-xs text-zg-text-muted">
            couverts · {totals.dinnerGroups} groupe{totals.dinnerGroups > 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 border-t border-zg-border pt-4 text-sm">
        <p className="text-zg-text-muted">
          Semaine :{" "}
          <span className="font-semibold text-zg-fg">{totals.weekdayCovers} couverts</span>
        </p>
        <p className="text-zg-text-muted">
          Week-end :{" "}
          <span className="font-semibold text-zg-fg">{totals.weekendCovers} couverts</span>
        </p>
      </div>
    </article>
  );
}
