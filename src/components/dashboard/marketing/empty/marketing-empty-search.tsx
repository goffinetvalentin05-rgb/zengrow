"use client";

import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import { DEFAULT_CAMPAIGN_FILTERS } from "@/src/components/dashboard/marketing/utils/campaign-filters";
import Button from "@/src/components/ui/button";
import { Search } from "lucide-react";

export default function MarketingEmptySearch() {
  const { filters, setFilters } = useMarketing();
  const q = filters.query.trim();

  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-zg-border bg-zg-surface/60 px-6 py-12 text-center sm:min-h-[260px]">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zg-info-soft-bg" aria-hidden>
        <Search className="h-7 w-7 text-zg-info" strokeWidth={1.75} />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-zg-fg">
        {q ? (
          <>
            Aucune campagne pour « <span className="text-zg-accent">{q}</span> »
          </>
        ) : (
          "Aucune campagne dans cette vue"
        )}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zg-text-muted">
        Modifiez la recherche ou changez le filtre de statut.
      </p>
      <Button
        type="button"
        variant="secondary"
        size="md"
        className="mt-6"
        onClick={() => setFilters(DEFAULT_CAMPAIGN_FILTERS)}
      >
        Réinitialiser les filtres
      </Button>
    </div>
  );
}
