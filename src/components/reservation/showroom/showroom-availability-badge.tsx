"use client";

import { cn } from "@/src/lib/utils";
import type { ShowroomAvailability } from "@/src/lib/public-page/showroom-availability";

/** Badge discret — ex. « Ouvert ce soir · 18:00–22:00 » */
export function ShowroomAvailabilityBadge({
  availability,
  className,
}: {
  availability: ShowroomAvailability;
  className?: string;
}) {
  const headline = availability.headline.trim();
  const time = availability.timeRange?.trim();
  if (!headline) return null;

  return (
    <span className={cn("zg-showroom-availability-badge", className)}>
      <span className="zg-showroom-availability-badge__headline">{headline}</span>
      {time ? (
        <>
          <span className="zg-showroom-availability-badge__sep" aria-hidden>
            ·
          </span>
          <span className="zg-showroom-availability-badge__time">{time}</span>
        </>
      ) : null}
    </span>
  );
}
