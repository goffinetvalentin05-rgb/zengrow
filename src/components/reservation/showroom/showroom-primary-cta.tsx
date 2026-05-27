"use client";

import Link from "next/link";
import { cn } from "@/src/lib/utils";

/** Bouton principal de conversion — sous le hero, très visible */
export function ShowroomPrimaryCta({
  label,
  onReserve,
  reserveHref,
  className,
}: {
  label: string;
  onReserve: () => void;
  reserveHref?: string | null;
  className?: string;
}) {
  const ctaClassName = cn("zg-showroom-primary-cta w-full", className);

  if (reserveHref?.trim()) {
    return (
      <div className="zg-showroom-primary-cta-wrap px-5 pb-2 pt-1 sm:px-6">
        <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl">
          <Link href={reserveHref.trim()} className={ctaClassName}>
            {label}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="zg-showroom-primary-cta-wrap px-5 pb-2 pt-1 sm:px-6">
      <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl">
        <button type="button" onClick={onReserve} className={ctaClassName}>
          {label}
        </button>
      </div>
    </div>
  );
}
