"use client";

import CustomersList from "@/src/components/dashboard/customers/list/customers-list";

export default function CustomersListShell() {
  return (
    <section aria-labelledby="customers-list-heading">
      <h2 id="customers-list-heading" className="sr-only">
        Liste des clients
      </h2>
      <CustomersList />
    </section>
  );
}
