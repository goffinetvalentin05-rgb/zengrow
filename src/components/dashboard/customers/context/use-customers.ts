"use client";

import { useContext } from "react";
import { CustomersContext } from "@/src/components/dashboard/customers/context/customers-context";

export function useCustomers() {
  const ctx = useContext(CustomersContext);
  if (!ctx) {
    throw new Error("useCustomers must be used within CustomersProvider");
  }
  return ctx;
}
