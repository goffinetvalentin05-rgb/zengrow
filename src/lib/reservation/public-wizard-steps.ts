import type { ReservationMode } from "@/src/lib/reservation/reservation-modes";

export type PublicWizardStepKey = "guests" | "date" | "time" | "zone" | "contact";

export function buildPublicWizardSteps(
  reservationMode: ReservationMode,
  allowTerraceZoneChoice: boolean,
): PublicWizardStepKey[] {
  if (reservationMode === "time_slots") {
    const steps: PublicWizardStepKey[] = ["guests", "date", "time"];
    if (allowTerraceZoneChoice) steps.push("zone");
    steps.push("contact");
    return steps;
  }

  const steps: PublicWizardStepKey[] = ["date", "guests", "time"];
  if (allowTerraceZoneChoice) steps.push("zone");
  steps.push("contact");
  return steps;
}
