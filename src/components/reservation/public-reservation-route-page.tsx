"use client";

import PublicReservationForm, {
  type PublicReservationFormProps,
} from "@/src/components/reservation/public-reservation-form";

export type PublicReservationRoutePageProps = Omit<
  PublicReservationFormProps,
  "forceLandingExperience" | "previewMode" | "dedicatedReservationPage"
>;

export default function PublicReservationRoutePage(props: PublicReservationRoutePageProps) {
  return <PublicReservationForm {...props} dedicatedReservationPage previewMode={false} />;
}
