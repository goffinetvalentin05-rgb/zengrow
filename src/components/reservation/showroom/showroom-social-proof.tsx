"use client";

import { cn } from "@/src/lib/utils";

/** Badge premium — sans étoiles */
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
    <span className={cn("zg-showroom-proof-badge", className)}>
      Noté {score} sur Google · {reviewCount} avis
    </span>
  );
}
