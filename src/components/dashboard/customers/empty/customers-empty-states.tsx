"use client";

import type { ReactNode } from "react";
import { useCustomers } from "@/src/components/dashboard/customers/context/use-customers";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { Search, UtensilsCrossed, UserPlus } from "lucide-react";

type CustomersEmptyPanelProps = {
  children: ReactNode;
  className?: string;
};

function CustomersEmptyPanel({ children, className }: CustomersEmptyPanelProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zg-border bg-zg-surface px-6 py-10 sm:py-14",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CustomersEmptyBase() {
  const { onAddCustomer } = useCustomers();

  return (
    <CustomersEmptyPanel>
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zg-accent-soft-bg text-3xl"
          aria-hidden
        >
          <UtensilsCrossed className="h-9 w-9 text-zg-accent" strokeWidth={1.75} />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-zg-fg">Aucun client pour le moment</h3>
        <p className="mt-2 text-sm leading-relaxed text-zg-text-muted">
          Vos clients apparaîtront ici dès qu&apos;ils réserveront en ligne ou que vous en ajouterez
          manuellement.
        </p>
        <Button
          type="button"
          variant="primary"
          size="md"
          className="mt-6 w-full sm:w-auto"
          onClick={onAddCustomer}
        >
          <UserPlus className="h-4 w-4" strokeWidth={2} aria-hidden />
          Ajouter un client
        </Button>
      </div>
    </CustomersEmptyPanel>
  );
}

export function CustomersEmptySearch() {
  const { filters, resetFilters } = useCustomers();
  const q = filters.query.trim();

  return (
    <CustomersEmptyPanel>
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zg-info-soft-bg"
          aria-hidden
        >
          <Search className="h-9 w-9 text-zg-info" strokeWidth={1.75} />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-zg-fg">
          {q ? (
            <>
              Aucun client trouvé pour « <span className="text-zg-accent">{q}</span> »
            </>
          ) : (
            "Aucun client trouvé"
          )}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-zg-text-muted">
          Essayez avec d&apos;autres mots-clés ou retirez vos filtres.
        </p>
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="mt-6 w-full sm:w-auto"
          onClick={resetFilters}
        >
          Effacer les filtres
        </Button>
      </div>
    </CustomersEmptyPanel>
  );
}
