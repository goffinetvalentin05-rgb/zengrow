"use client";

import { useCustomers } from "@/src/components/dashboard/customers/context/use-customers";
import { cn } from "@/src/lib/utils";
import { X } from "lucide-react";

export default function CustomersFilterPills() {
  const { filterPills, clearFilter } = useCustomers();

  if (filterPills.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Filtres actifs">
      {filterPills.map((pill) => (
        <li key={pill.key}>
          <button
            type="button"
            onClick={() => clearFilter(pill.key)}
            className={cn(
              "inline-flex max-w-full items-center gap-1.5 rounded-full border border-zg-border bg-zg-surface-elevated px-3 py-1.5 text-xs font-medium text-zg-fg transition-colors",
              "hover:border-zg-border-hover hover:bg-zg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/25",
            )}
          >
            <span className="truncate">{pill.label}</span>
            <X className="h-3.5 w-3.5 shrink-0 text-zg-text-muted" strokeWidth={2} aria-hidden />
            <span className="sr-only">Retirer le filtre</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
