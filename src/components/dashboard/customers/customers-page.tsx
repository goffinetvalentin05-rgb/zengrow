"use client";

import { CustomersProvider } from "@/src/components/dashboard/customers/context/customers-provider";
import CustomerDetailModal from "@/src/components/dashboard/customers/detail/customer-detail-modal";
import CustomersHeader from "@/src/components/dashboard/customers/header/customers-header";
import CustomersKpiCards from "@/src/components/dashboard/customers/header/customers-kpi-cards";
import CustomersListShell from "@/src/components/dashboard/customers/list/customers-list-shell";
import CustomersToolbar from "@/src/components/dashboard/customers/toolbar/customers-toolbar";
import { useCustomers } from "@/src/components/dashboard/customers/context/use-customers";
import type { CustomersPageProps } from "@/src/components/dashboard/customers/types";

function CustomersPageContent() {
  const { customers } = useCustomers();
  const hasCustomers = customers.length > 0;

  return (
    <section className="w-full min-w-0 space-y-8 md:space-y-12">
      <CustomersHeader />
      <CustomersKpiCards />
      {hasCustomers ? <CustomersToolbar /> : null}
      <CustomersListShell />
      <CustomerDetailModal />
    </section>
  );
}

type CustomersPageClientProps = CustomersPageProps & {
  initialOpenCustomerId?: string | null;
};

export default function CustomersPage({ initialOpenCustomerId, ...props }: CustomersPageClientProps) {
  return (
    <CustomersProvider {...props} initialOpenCustomerId={initialOpenCustomerId}>
      <CustomersPageContent />
    </CustomersProvider>
  );
}
