"use client";

import { useCustomers } from "@/src/components/dashboard/customers/context/use-customers";

export default function CustomersListShell() {
  const { customers } = useCustomers();

  return (
    <section aria-labelledby="customers-list-heading" className="space-y-3">
      <h2 id="customers-list-heading" className="text-sm font-medium text-zg-text-muted">
        {customers.length === 0
          ? "Aucun client"
          : `${customers.length} client${customers.length > 1 ? "s" : ""}`}
      </h2>
      <div className="rounded-2xl border border-dashed border-zg-border bg-zg-surface/50 px-6 py-16 text-center">
        <p className="text-sm font-medium text-zg-fg">Nouvelle liste en préparation</p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-zg-text-muted">
          Les cartes clients et la fiche détaillée arrivent aux prochaines étapes de la refonte.
        </p>
      </div>
    </section>
  );
}
