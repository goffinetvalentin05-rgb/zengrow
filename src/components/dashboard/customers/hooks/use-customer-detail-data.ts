"use client";

import { useEffect, useState } from "react";
import type {
  CustomerDetailStats,
  CustomerReservationSummary,
} from "@/src/components/dashboard/customers/types";
import { computeCustomerDetailStats } from "@/src/components/dashboard/customers/utils/customer-detail";
import { createClient } from "@/src/lib/supabase/client";

const RESERVATION_COLUMNS =
  "id, reservation_date, reservation_time, guests, status, internal_note, source, reservation_type";

export function useCustomerDetailData(customerId: string | null) {
  const [recentReservations, setRecentReservations] = useState<CustomerReservationSummary[]>([]);
  const [totalReservationCount, setTotalReservationCount] = useState(0);
  const [stats, setStats] = useState<CustomerDetailStats>({
    totalCovers: 0,
    acquisitionSource: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setRecentReservations([]);
      setTotalReservationCount(0);
      setStats({ totalCovers: 0, acquisitionSource: null });
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      const supabase = createClient();

      const [recentResult, allResult] = await Promise.all([
        supabase
          .from("reservations")
          .select(RESERVATION_COLUMNS, { count: "exact" })
          .eq("customer_id", customerId)
          .neq("reservation_type", "walkin")
          .order("reservation_date", { ascending: false })
          .order("reservation_time", { ascending: false })
          .limit(6),
        supabase
          .from("reservations")
          .select(RESERVATION_COLUMNS)
          .eq("customer_id", customerId)
          .neq("reservation_type", "walkin"),
      ]);

      if (cancelled) return;

      if (recentResult.error || allResult.error) {
        setError(recentResult.error?.message ?? allResult.error?.message ?? "Erreur de chargement");
        setLoading(false);
        return;
      }

      const recent = (recentResult.data ?? []) as CustomerReservationSummary[];
      const all = (allResult.data ?? []) as CustomerReservationSummary[];

      setRecentReservations(recent.slice(0, 5));
      setTotalReservationCount(recentResult.count ?? all.length);
      setStats(computeCustomerDetailStats(all));
      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [customerId]);

  return {
    recentReservations,
    totalReservationCount,
    stats,
    loading,
    error,
  };
}
