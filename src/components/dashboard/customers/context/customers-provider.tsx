"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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
import { createClient } from "@/src/lib/supabase/client";
import { AlertCircle, Pencil, UserPlus } from "lucide-react";

function noteDraftsFromCustomers(customers: CustomersPageProps["customers"]) {
  return Object.fromEntries(
    customers.map((customer) => [customer.id, customer.internalNote ?? ""]),
  );
}

type CustomersProviderProps = CustomersPageProps & {
  children: ReactNode;
};

export function CustomersProvider({ customers: initialCustomers, kpis, children }: CustomersProviderProps) {
  const router = useRouter();
  const showToast = useDashboardToast();
  const [customerRecords, setCustomerRecords] = useState(initialCustomers);
  const [filters, setFilters] = useState(DEFAULT_CUSTOMER_FILTERS);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>(() =>
    noteDraftsFromCustomers(initialCustomers),
  );
  const [noteSavingId, setNoteSavingId] = useState<string | null>(null);

  useEffect(() => {
    setCustomerRecords(initialCustomers);
    setNoteDrafts((prev) => {
      const next = { ...prev };
      for (const customer of initialCustomers) {
        next[customer.id] = customer.internalNote ?? "";
      }
      return next;
    });
  }, [initialCustomers]);

  const selectedCustomer = useMemo(
    () => customerRecords.find((c) => c.id === selectedCustomerId) ?? null,
    [customerRecords, selectedCustomerId],
  );

  const filteredCustomers = useMemo(
    () => filterCustomers(customerRecords, filters),
    [customerRecords, filters],
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
        message: "Le formulaire de modification arrive bientôt.",
        icon: Pencil,
      });
    },
    [showToast],
  );

  const saveCustomerNote = useCallback(
    async (customerId: string) => {
      const internalNote = noteDrafts[customerId] ?? "";
      setNoteSavingId(customerId);
      const supabase = createClient();
      const { error } = await supabase
        .from("customers")
        .update({ internal_note: internalNote.trim() || null })
        .eq("id", customerId);

      setNoteSavingId(null);

      if (error) {
        showToast({
          message: error.message,
          icon: AlertCircle,
        });
        return;
      }

      setCustomerRecords((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, internalNote: internalNote.trim() || null } : c,
        ),
      );
    },
    [noteDrafts, showToast],
  );

  const deleteCustomer = useCallback(
    async (customerId: string): Promise<boolean> => {
      const supabase = createClient();
      const { error: reservationsError } = await supabase
        .from("reservations")
        .delete()
        .eq("customer_id", customerId);

      if (reservationsError) {
        showToast({
          message: reservationsError.message,
          icon: AlertCircle,
        });
        return false;
      }

      const { error: customerError } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

      if (customerError) {
        showToast({
          message: customerError.message,
          icon: AlertCircle,
        });
        return false;
      }

      setCustomerRecords((prev) => prev.filter((c) => c.id !== customerId));
      setNoteDrafts((prev) => {
        const next = { ...prev };
        delete next[customerId];
        return next;
      });
      setSelectedCustomerId(null);
      router.refresh();
      return true;
    },
    [router, showToast],
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
      customers: customerRecords,
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
      selectedCustomer,
      openCustomerDetail,
      closeCustomerDetail,
      onEditCustomer,
      deleteCustomer,
      noteDrafts,
      setNoteDrafts,
      noteSavingId,
      saveCustomerNote,
    }),
    [
      customerRecords,
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
      selectedCustomer,
      openCustomerDetail,
      closeCustomerDetail,
      onEditCustomer,
      deleteCustomer,
      noteDrafts,
      noteSavingId,
      saveCustomerNote,
    ],
  );

  return <CustomersContext.Provider value={value}>{children}</CustomersContext.Provider>;
}
