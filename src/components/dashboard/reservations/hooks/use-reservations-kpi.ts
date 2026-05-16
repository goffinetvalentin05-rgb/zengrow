"use client";

import { useMemo } from "react";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import {
  computeTodayCoversKpi,
  computeTodayFillKpi,
  computeWeekReservationsKpi,
  formatCoversSubline,
} from "@/src/components/dashboard/reservations/utils/reservation-kpi";
import { calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";

export function useReservationsKpi() {
  const { reservations, restaurantCapacity, openingHours } = useReservations();
  const todayYmd = calendarYmdInBusinessTz();

  return useMemo(() => {
    const covers = computeTodayCoversKpi(reservations, todayYmd, openingHours);
    const fill = computeTodayFillKpi(covers, restaurantCapacity);
    const week = computeWeekReservationsKpi(reservations, todayYmd);
    const coversSubline = formatCoversSubline(covers);

    return {
      todayYmd,
      covers,
      coversSubline,
      fill,
      week,
    };
  }, [reservations, todayYmd, openingHours, restaurantCapacity]);
}
