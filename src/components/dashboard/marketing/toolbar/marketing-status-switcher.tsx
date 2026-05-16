"use client";

import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import type { CampaignStatusFilter } from "@/src/components/dashboard/marketing/utils/campaign-filters";
import { countCampaignsByStatus } from "@/src/components/dashboard/marketing/utils/campaign-filters";
import { cn } from "@/src/lib/utils";

const STATUS_OPTIONS: {
  value: CampaignStatusFilter;
  label: string;
  disabled?: boolean;
  title?: string;
}[] = [
  { value: "all", label: "Toutes" },
  { value: "sent", label: "Envoyées" },
  { value: "draft", label: "Brouillons" },
  {
    value: "scheduled",
    label: "Programmées",
    disabled: true,
    title: "Campagnes programmées — bientôt disponible (V2)",
  },
];

export default function MarketingStatusSwitcher() {
  const { campaigns, filters, setFilters } = useMarketing();

  return (
    <div
      role="tablist"
      aria-label="Filtrer par statut"
      className="inline-flex max-w-full flex-wrap rounded-xl border border-zg-border bg-zg-surface p-1"
    >
      {STATUS_OPTIONS.map(({ value, label, disabled, title }) => {
        const active = filters.status === value;
        const count = countCampaignsByStatus(campaigns, value);
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            title={title}
            onClick={() => setFilters((prev) => ({ ...prev, status: value }))}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              disabled && "cursor-not-allowed opacity-45",
              active
                ? "bg-zg-accent text-white shadow-sm"
                : "text-zg-text-muted hover:bg-zg-card-hover hover:text-zg-fg",
            )}
          >
            {label}
            <span
              className={cn(
                "tabular-nums text-xs font-semibold",
                active ? "text-white/85" : "text-zg-text-muted",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
