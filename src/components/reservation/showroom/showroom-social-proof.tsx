"use client";

import { cn } from "@/src/lib/utils";

/** Ligne discrète — pas d’étoiles, pas de badges */
export function ShowroomSocialProof({
  googleRating,
  reviewCount,
  className,
}: {
  googleRating: number;
  reviewCount: number;
  className?: string;
}) {
  const score = googleRating.toFixed(1);

  return (
    <p className={cn("zg-showroom-proof-line", className)}>
      Noté {score} sur Google · {reviewCount} avis
    </p>
  );
}
