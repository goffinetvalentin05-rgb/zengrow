"use client";

import MarketingStatusSwitcher from "@/src/components/dashboard/marketing/toolbar/marketing-status-switcher";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import Input from "@/src/components/ui/input";
import { Search } from "lucide-react";

export default function MarketingToolbar() {
  const { campaigns, filters, setFilters, filteredCampaigns } = useMarketing();

  if (campaigns.length === 0) return null;

  const foundLabel =
    filteredCampaigns.length === 0
      ? "Aucune campagne trouvée"
      : filteredCampaigns.length === 1
        ? "1 campagne trouvée"
        : `${filteredCampaigns.length} campagnes trouvées`;

  return (
    <section aria-labelledby="marketing-toolbar-heading" className="space-y-4">
      <h2 id="marketing-toolbar-heading" className="sr-only">
        Filtres campagnes
      </h2>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <MarketingStatusSwitcher />
        <div className="relative w-full lg:max-w-sm lg:shrink-0">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zg-text-muted"
            strokeWidth={2}
            aria-hidden
          />
          <Input
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            value={filters.query}
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            placeholder="Rechercher une campagne…"
            className="min-h-11 w-full pl-10"
            aria-label="Rechercher par nom de campagne"
          />
        </div>
      </div>

      <p className="text-xs text-zg-text-muted" aria-live="polite" aria-atomic="true">
        {foundLabel}
      </p>
    </section>
  );
}
