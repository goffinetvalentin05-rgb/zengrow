"use client";

/**
 * Renderer public officiel pour zengrow.ch/r/[slug].
 * Landing cinématique de conversion — jamais le template « site web » legacy.
 */
import PublicReservationForm, {
  type PublicReservationFormProps,
} from "@/src/components/reservation/public-reservation-form";

export type PublicLandingPageProps = Omit<PublicReservationFormProps, "forceLandingExperience" | "previewMode">;

export default function PublicLandingPage(props: PublicLandingPageProps) {
  return <PublicReservationForm {...props} forceLandingExperience previewMode={false} />;
}
