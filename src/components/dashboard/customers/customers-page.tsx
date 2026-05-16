"use client";

import { CustomersProvider } from "@/src/components/dashboard/customers/context/customers-provider";
import CustomersHeader from "@/src/components/dashboard/customers/header/customers-header";
import CustomersKpiCards from "@/src/components/dashboard/customers/header/customers-kpi-cards";
import CustomersListShell from "@/src/components/dashboard/customers/list/customers-list-shell";
import CustomersToolbar from "@/src/components/dashboard/customers/toolbar/customers-toolbar";
import type { CustomersPageProps } from "@/src/components/dashboard/customers/types";

export default function CustomersPage(props: CustomersPageProps) {
  return (
    <CustomersProvider {...props}>
      <section className="space-y-10 md:space-y-12">
        <CustomersHeader />
        <CustomersKpiCards />
        <CustomersToolbar />
        <CustomersListShell />
      </section>
    </CustomersProvider>
  );
}
