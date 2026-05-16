"use client";

import { useState } from "react";
import CustomersFilterPills from "@/src/components/dashboard/customers/toolbar/customers-filter-pills";
import CustomersFiltersDrawer from "@/src/components/dashboard/customers/toolbar/customers-filters-drawer";
import { useCustomers } from "@/src/components/dashboard/customers/context/use-customers";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { Filter, Search } from "lucide-react";

export default function CustomersToolbar() {
  const { filters, setFilters, filteredCustomers, activeFilterCount, customers } = useCustomers();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (customers.length === 0) return null;

  const foundLabel =
    filteredCustomers.length === 0
      ? "Aucun client trouvé"
      : filteredCustomers.length === 1
        ? "1 client trouvé"
        : `${filteredCustomers.length} clients trouvés`;

  return (
    <section aria-labelledby="customers-toolbar-heading" className="space-y-3">
      <h2 id="customers-toolbar-heading" className="sr-only">
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
            placeholder="Rechercher par nom, email ou téléphone..."
            className="min-h-11 w-full pl-10"
            aria-label="Rechercher un client par nom, email ou téléphone"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="w-full shrink-0 sm:w-auto sm:min-w-[7.5rem]"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="customers-filters-drawer"
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

      <CustomersFilterPills />

      <p className="text-xs text-zg-text-muted" aria-live="polite" aria-atomic="true">
        {foundLabel}
      </p>

      <CustomersFiltersDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </section>
  );
}
