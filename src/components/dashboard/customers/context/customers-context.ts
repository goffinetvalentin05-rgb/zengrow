"use client";

import { createContext, type Dispatch, type SetStateAction } from "react";
import type { CustomerKpis, CustomerRecord } from "@/src/components/dashboard/customers/types";
import type {
  CustomerFilterPill,
  CustomerFilters,
  FilterPillKey,
} from "@/src/components/dashboard/customers/utils/customer-filters";

export type CustomersContextValue = {
  customers: CustomerRecord[];
  filteredCustomers: CustomerRecord[];
  kpis: CustomerKpis;
  filters: CustomerFilters;
  setFilters: Dispatch<SetStateAction<CustomerFilters>>;
  filterPills: CustomerFilterPill[];
  clearFilter: (key: FilterPillKey) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  onExportCsv: () => void;
  onAddCustomer: () => void;
  selectedCustomerId: string | null;
  openCustomerDetail: (customerId: string) => void;
  closeCustomerDetail: () => void;
  onEditCustomer: (customerId: string) => void;
};

export const CustomersContext = createContext<CustomersContextValue | null>(null);
