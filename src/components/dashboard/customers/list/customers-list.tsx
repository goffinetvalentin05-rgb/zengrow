"use client";

import CustomerListRow from "@/src/components/dashboard/customers/list/customer-list-row";
import { useCustomers } from "@/src/components/dashboard/customers/context/use-customers";
import Button from "@/src/components/ui/button";
import EmptyState from "@/src/components/ui/empty-state";
import { Search, Utensils, UserPlus } from "lucide-react";

export default function CustomersList() {
  const {
    customers,
    filteredCustomers,
    filters,
    resetFilters,
    onAddCustomer,
  } = useCustomers();

  if (customers.length === 0) {
    return (
      <div className="rounded-2xl border border-zg-border bg-zg-surface px-6 py-4">
        <EmptyState
          icon={Utensils}
          title="Aucun client pour le moment"
          description="Vos clients apparaîtront ici dès qu'ils réserveront en ligne ou que vous en ajouterez manuellement."
          action={
            <Button type="button" variant="primary" size="md" onClick={onAddCustomer}>
              <UserPlus className="h-4 w-4" strokeWidth={2} aria-hidden />
              Ajouter un client
            </Button>
          }
        />
      </div>
    );
  }

  if (filteredCustomers.length === 0) {
    const q = filters.query.trim();
    return (
      <div className="rounded-2xl border border-zg-border bg-zg-surface px-6 py-4">
        <EmptyState
          icon={Search}
          title={q ? `Aucun client trouvé pour « ${q} »` : "Aucun client trouvé"}
          description="Essayez avec d'autres mots-clés ou retirez vos filtres."
          action={
            <Button type="button" variant="secondary" size="md" onClick={resetFilters}>
              Effacer les filtres
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <ul className="space-y-2" role="list">
      {filteredCustomers.map((customer) => (
        <li key={customer.id}>
          <CustomerListRow customer={customer} />
        </li>
      ))}
    </ul>
  );
}
