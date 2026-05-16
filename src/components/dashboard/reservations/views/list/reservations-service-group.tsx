import type { ServiceGroup } from "@/src/components/dashboard/reservations/utils/reservation-grouping";
import { Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";

type ReservationsServiceGroupProps = {
  group: ServiceGroup;
  children: ReactNode;
};

export default function ReservationsServiceGroup({ group, children }: ReservationsServiceGroupProps) {
  const Icon = group.key === "lunch" ? Sun : Moon;

  return (
    <section className="overflow-hidden rounded-2xl border border-zg-border bg-zg-surface/60">
      <header className="flex items-center justify-between gap-3 border-b border-zg-border bg-zg-surface-elevated px-4 py-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-zg-accent" aria-hidden />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-zg-fg">{group.label}</h3>
        </div>
        <p className="text-xs font-medium text-zg-text-muted">
          {group.reservationCount} réservation{group.reservationCount > 1 ? "s" : ""} ·{" "}
          {group.coverCount} couvert{group.coverCount > 1 ? "s" : ""}
        </p>
      </header>
      <div className="space-y-2 p-3">{children}</div>
    </section>
  );
}
