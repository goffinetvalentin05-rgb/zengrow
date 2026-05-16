"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { CustomersContext } from "@/src/components/dashboard/customers/context/customers-context";
import type { CustomersPageProps } from "@/src/components/dashboard/customers/types";
import { downloadCustomersCsv } from "@/src/components/dashboard/customers/utils/customer-csv";
import {
  buildFilterPills,
  clearFilterKey,
  countActiveFilters,
  DEFAULT_CUSTOMER_FILTERS,
  filterCustomers,
  type FilterPillKey,
} from "@/src/components/dashboard/customers/utils/customer-filters";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { Pencil, UserPlus } from "lucide-react";

type CustomersProviderProps = CustomersPageProps & {
  children: ReactNode;
};

export function CustomersProvider({ customers, kpis, children }: CustomersProviderProps) {
  const showToast = useDashboardToast();
  const [filters, setFilters] = useState(DEFAULT_CUSTOMER_FILTERS);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const filteredCustomers = useMemo(
    () => filterCustomers(customers, filters),
    [customers, filters],
  );

  const filterPills = useMemo(() => buildFilterPills(filters), [filters]);
  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const clearFilter = useCallback((key: FilterPillKey) => {
    setFilters((prev) => clearFilterKey(prev, key));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_CUSTOMER_FILTERS);
  }, []);

  const openCustomerDetail = useCallback((customerId: string) => {
    setSelectedCustomerId(customerId);
  }, []);

  const closeCustomerDetail = useCallback(() => {
    setSelectedCustomerId(null);
  }, []);

  const onEditCustomer = useCallback(
    (_customerId: string) => {
      showToast({
        message: "La modification client arrive avec la fiche détaillée.",
        icon: Pencil,
      });
    },
    [showToast],
  );

  const onExportCsv = useCallback(() => {
    downloadCustomersCsv(filteredCustomers);
  }, [filteredCustomers]);

  const onAddCustomer = useCallback(() => {
    showToast({
      message: "L'ajout manuel de clients arrive très bientôt.",
      icon: UserPlus,
    });
  }, [showToast]);

  const value = useMemo(
    () => ({
      customers,
      filteredCustomers,
      kpis,
      filters,
      setFilters,
      filterPills,
      clearFilter,
      resetFilters,
      activeFilterCount,
      onExportCsv,
      onAddCustomer,
      selectedCustomerId,
      openCustomerDetail,
      closeCustomerDetail,
      onEditCustomer,
    }),
    [
      customers,
      filteredCustomers,
      kpis,
      filters,
      filterPills,
      clearFilter,
      resetFilters,
      activeFilterCount,
      onExportCsv,
      onAddCustomer,
      selectedCustomerId,
      openCustomerDetail,
      closeCustomerDetail,
      onEditCustomer,
    ],
  );

  return <CustomersContext.Provider value={value}>{children}</CustomersContext.Provider>;
}
