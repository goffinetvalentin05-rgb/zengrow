"use client";

import { useEffect, useRef } from "react";
import { useCustomers } from "@/src/components/dashboard/customers/context/use-customers";

const DEBOUNCE_MS = 1000;

/** Sauvegarde automatique de la note interne client dans le modal (debounce 1 s). */
export function useCustomerDetailNote(customerId: string | null) {
  const { noteDrafts, saveCustomerNote } = useCustomers();
  const note = customerId ? (noteDrafts[customerId] ?? "") : "";
  const skipNextSave = useRef(true);
  const customerIdRef = useRef(customerId);

  useEffect(() => {
    if (customerIdRef.current !== customerId) {
      customerIdRef.current = customerId;
      skipNextSave.current = true;
    }
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void saveCustomerNote(customerId);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [note, customerId, saveCustomerNote]);

  return note;
}
