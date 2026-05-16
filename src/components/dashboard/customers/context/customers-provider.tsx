"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import { CustomersContext } from "@/src/components/dashboard/customers/context/customers-context";
import type { CustomersPageProps } from "@/src/components/dashboard/customers/types";
import { downloadCustomersCsv } from "@/src/components/dashboard/customers/utils/customer-csv";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { UserPlus } from "lucide-react";

type CustomersProviderProps = CustomersPageProps & {
  children: ReactNode;
};

export function CustomersProvider({ customers, kpis, children }: CustomersProviderProps) {
  const showToast = useDashboardToast();

  const onExportCsv = useCallback(() => {
    downloadCustomersCsv(customers);
  }, [customers]);

  const onAddCustomer = useCallback(() => {
    showToast({
      message: "L'ajout manuel de clients arrive très bientôt.",
      icon: UserPlus,
    });
  }, [showToast]);

  const value = useMemo(
    () => ({ customers, kpis, onExportCsv, onAddCustomer }),
    [customers, kpis, onExportCsv, onAddCustomer],
  );

  return <CustomersContext.Provider value={value}>{children}</CustomersContext.Provider>;
}
