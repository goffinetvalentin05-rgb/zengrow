"use client";

import Button from "@/src/components/ui/button";
import { PartyPopper } from "lucide-react";

type ReservationsListDayEmptyProps = {
  isToday: boolean;
  onAddReservation: () => void;
};

export default function ReservationsListDayEmpty({
  isToday,
  onAddReservation,
}: ReservationsListDayEmptyProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-zg-border bg-zg-surface/30 px-6 py-16 text-center">
      <PartyPopper className="h-10 w-10 text-zg-accent" strokeWidth={1.75} aria-hidden />
      <h2 className="mt-4 text-lg font-semibold text-zg-fg">
        {isToday ? "Aucune réservation pour aujourd'hui" : "Aucune réservation pour cette date"}
      </h2>
      <p className="mt-2 max-w-md text-sm text-zg-text-muted">
        {isToday
          ? "Profite d'une journée calme ou ajoute une résa manuelle."
          : "Aucune réservation n'est prévue pour le jour sélectionné."}
      </p>
      <Button type="button" className="mt-6" onClick={onAddReservation}>
        Nouvelle réservation
      </Button>
    </div>
  );
}
