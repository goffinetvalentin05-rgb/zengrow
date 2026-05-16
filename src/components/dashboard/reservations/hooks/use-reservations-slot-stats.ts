"use client";

import { useMemo } from "react";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import { addCalendarDaysYmd } from "@/src/components/dashboard/reservations/utils/reservation-filters";
import {
  computeDayServiceSlotStats,
  computePeriodServiceTotals,
} from "@/src/components/dashboard/reservations/utils/reservation-slot-stats";
import { calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";

export function useReservationsSlotStats() {
  const {
    reservations,
    daySectionDate,
    openingHours,
    restaurantCapacity,
    viewMode,
  } = useReservations();

  const isToday = daySectionDate === calendarYmdInBusinessTz();

  const dayServices = useMemo(
    () =>
      computeDayServiceSlotStats({
        reservations,
        ymd: daySectionDate,
        openingHours,
        restaurantCapacity,
      }),
    [reservations, daySectionDate, openingHours, restaurantCapacity],
  );

  const periodTotals = useMemo(() => {
    const toYmd = daySectionDate;
    const fromYmd = addCalendarDaysYmd(daySectionDate, -6);
    return computePeriodServiceTotals({
      reservations,
      fromYmd,
      toYmd,
      openingHours,
    });
  }, [reservations, daySectionDate, openingHours]);

  const showDayServiceCards = viewMode === "list";

  return {
    isToday,
    daySectionDate,
    dayServices,
    periodTotals,
    showDayServiceCards,
    periodRangeLabel: "7 derniers jours",
  };
}
