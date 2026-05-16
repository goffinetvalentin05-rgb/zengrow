"use client";

import { createContext } from "react";
import type { CustomerKpis, CustomerRecord } from "@/src/components/dashboard/customers/types";

export type CustomersContextValue = {
  customers: CustomerRecord[];
  kpis: CustomerKpis;
  onExportCsv: () => void;
  onAddCustomer: () => void;
};

export const CustomersContext = createContext<CustomersContextValue | null>(null);
