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
  selectedCustomer: CustomerRecord | null;
  openCustomerDetail: (customerId: string) => void;
  closeCustomerDetail: () => void;
  onEditCustomer: (customerId: string) => void;
  deleteCustomer: (customerId: string) => Promise<boolean>;
  noteDrafts: Record<string, string>;
  setNoteDrafts: Dispatch<SetStateAction<Record<string, string>>>;
  noteSavingId: string | null;
  saveCustomerNote: (customerId: string) => Promise<void>;
};

export const CustomersContext = createContext<CustomersContextValue | null>(null);
