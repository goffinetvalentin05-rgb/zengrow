"use client";

import PageHeader from "@/src/components/dashboard/page-header";
import { useCustomers } from "@/src/components/dashboard/customers/context/use-customers";
import { Download, UserPlus } from "lucide-react";

export default function CustomersHeader() {
  const { onExportCsv, onAddCustomer } = useCustomers();

  return (
    <PageHeader
      title="Clients"
      subtitle="Votre base de clients."
      secondaryActions={[
        {
          kind: "button",
          label: "Exporter CSV",
          icon: <Download className="h-4 w-4" strokeWidth={2} />,
          onClick: onExportCsv,
        },
      ]}
      primaryAction={{
        kind: "button",
        label: "Ajouter un client",
        icon: <UserPlus className="h-4 w-4" strokeWidth={2} />,
        onClick: onAddCustomer,
      }}
    />
  );
}
