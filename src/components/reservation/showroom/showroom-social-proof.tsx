"use client";

import { cn } from "@/src/lib/utils";

/** Social proof premium — sans étoiles, style pill ZenGrow */
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
  const countLabel =
    reviewCount >= 1000
      ? `+${Math.floor(reviewCount / 1000)}k avis`
      : reviewCount >= 100
        ? `+${reviewCount} avis`
        : `${reviewCount} avis`;

  return (
    <div className={cn("zg-showroom-proof", className)} role="group" aria-label={`Noté ${score} sur Google, ${reviewCount} avis`}>
      <span className="zg-showroom-proof-pill zg-showroom-proof-pill--score">
        <span className="zg-showroom-proof-score">{score}</span>
        <span className="zg-showroom-proof-slash">/5</span>
      </span>
      <span className="zg-showroom-proof-pill zg-showroom-proof-pill--label">
        {countLabel} Google
      </span>
    </div>
  );
}
