"use client";

import { useContext } from "react";
import { ReservationsContext } from "@/src/components/dashboard/reservations/context/reservations-context";

export function useReservations() {
  const value = useContext(ReservationsContext);
  if (!value) {
    throw new Error("useReservations doit être utilisé dans ReservationsProvider");
  }
  return value;
}
