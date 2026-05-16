"use client";

import { useState } from "react";
import FeedbacksFilterPills from "@/src/components/dashboard/feedbacks/toolbar/feedbacks-filter-pills";
import FeedbacksFiltersDrawer from "@/src/components/dashboard/feedbacks/toolbar/feedbacks-filters-drawer";
import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { Filter, Search } from "lucide-react";

export default function FeedbacksToolbar() {
  const { filters, setFilters, filteredFeedbacks, activeFilterCount, feedbacks } = useFeedbacks();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (feedbacks.length === 0) return null;

  const foundLabel =
    filteredFeedbacks.length === 0
      ? "Aucun feedback trouvé"
      : filteredFeedbacks.length === 1
        ? "1 feedback trouvé"
        : `${filteredFeedbacks.length} feedbacks trouvés`;

  return (
    <section aria-labelledby="feedbacks-toolbar-heading" className="space-y-3">
      <h2 id="feedbacks-toolbar-heading" className="sr-only">
        Recherche et filtres
      </h2>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="relative min-w-0 flex-1">
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
            placeholder="Rechercher par nom client ou contenu..."
            className="min-h-11 w-full pl-10"
            aria-label="Rechercher par nom client ou contenu du feedback"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="w-full shrink-0 sm:w-auto sm:min-w-[7.5rem]"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="feedbacks-filters-drawer"
        >
          <Filter className="h-4 w-4" strokeWidth={2} aria-hidden />
          Filtres
          {activeFilterCount > 0 ? (
            <span
              className={cn(
                "ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-zg-accent px-1.5 text-[11px] font-bold text-white",
              )}
              aria-label={`${activeFilterCount} filtres actifs`}
            >
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </div>

      <FeedbacksFilterPills />

      <p className="text-xs text-zg-text-muted" aria-live="polite" aria-atomic="true">
        {foundLabel}
      </p>

      <FeedbacksFiltersDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
