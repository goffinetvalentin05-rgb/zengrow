"use client";

import { useEffect, useRef, useState } from "react";
import { useCustomers } from "@/src/components/dashboard/customers/context/use-customers";
import { useDialogFocusTrap } from "@/src/components/dashboard/reservations/hooks/use-dialog-focus-trap";
import type {
  ActivityStatusFilter,
  AvgCoversRangeFilter,
  CustomerFilters,
  VisitRangeFilter,
} from "@/src/components/dashboard/customers/utils/customer-filters";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Select from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";
import { X } from "lucide-react";

type CustomersFiltersDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function CustomersFiltersDrawer({ open, onClose }: CustomersFiltersDrawerProps) {
  const { filters, setFilters, resetFilters } = useCustomers();
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<CustomerFilters>(filters);

  useDialogFocusTrap(open, panelRef);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  function apply() {
    setFilters(draft);
    onClose();
  }

  function handleReset() {
    resetFilters();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      role="presentation"
      onClick={onClose}
    >
      <div
        id="customers-filters-drawer"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="customers-filters-title"
        className={cn(
          "flex h-full w-full max-w-md flex-col border-l border-zg-border bg-zg-surface shadow-xl",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-zg-border px-5 py-4">
          <div>
            <h2 id="customers-filters-title" className="text-lg font-semibold text-zg-fg">
              Filtres
            </h2>
            <p className="mt-1 text-sm text-zg-text-muted">Affinez votre liste de clients</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zg-text-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/25"
            aria-label="Fermer les filtres"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div className="space-y-2">
            <label htmlFor="filter-visit-range" className="dashboard-field-label">
              Nombre de visites
            </label>
            <Select
              id="filter-visit-range"
              value={draft.visitRange}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  visitRange: e.target.value as VisitRangeFilter,
                }))
              }
            >
              <option value="all">Toutes</option>
              <option value="1">1 visite</option>
              <option value="2-5">2 à 5 visites</option>
              <option value="5-10">5 à 10 visites</option>
              <option value="10+">10 visites et plus</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="filter-activity" className="dashboard-field-label">
              Statut
            </label>
            <Select
              id="filter-activity"
              value={draft.activityStatus}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  activityStatus: e.target.value as ActivityStatusFilter,
                }))
              }
            >
              <option value="all">Tous</option>
              <option value="active_3m">Actif — visite &lt; 3 mois</option>
              <option value="inactive_3m">Inactif — &gt; 3 mois</option>
              <option value="inactive_6m">Inactif — &gt; 6 mois</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="filter-avg-covers" className="dashboard-field-label">
              Couverts moyens
            </label>
            <Select
              id="filter-avg-covers"
              value={draft.avgCoversRange}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  avgCoversRange: e.target.value as AvgCoversRangeFilter,
                }))
              }
            >
              <option value="all">Tous</option>
              <option value="1-2">1 à 2</option>
              <option value="3-4">3 à 4</option>
              <option value="5-6">5 à 6</option>
              <option value="7+">7 et plus</option>
            </Select>
          </div>

          <fieldset className="space-y-3">
            <legend className="dashboard-field-label">Période de première visite</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="filter-first-from" className="text-xs text-zg-text-muted">
                  Du
                </label>
                <Input
                  id="filter-first-from"
                  type="date"
                  value={draft.firstVisitFrom ?? ""}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      firstVisitFrom: e.target.value || null,
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="filter-first-to" className="text-xs text-zg-text-muted">
                  Au
                </label>
                <Input
                  id="filter-first-to"
                  type="date"
                  value={draft.firstVisitTo ?? ""}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      firstVisitTo: e.target.value || null,
                    }))
                  }
                />
              </div>
            </div>
          </fieldset>
        </div>

        <footer className="flex flex-col gap-2 border-t border-zg-border px-5 py-4 sm:flex-row">
          <Button type="button" variant="ghost" className="sm:flex-1" onClick={handleReset}>
            Réinitialiser
          </Button>
          <Button type="button" variant="primary" className="sm:flex-1" onClick={apply}>
            Appliquer
          </Button>
        </footer>
      </div>
    </div>
  );
}

