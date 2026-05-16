"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type CustomizationZoneProps = {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  /** Icône Lucide affichée avant le titre (alignée sur la nav latérale). */
  icon?: LucideIcon;
};

export default function CustomizationZone({
  id,
  title,
  description,
  children,
  className,
  icon: Icon,
}: CustomizationZoneProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scroll-mt-28 rounded-2xl border border-zg-border bg-zg-surface p-5 md:p-6", className)}
    >
      <header className="mb-6 border-b border-zg-border/70 pb-4">
        <h2
          id={`${id}-title`}
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zg-fg sm:text-xl"
        >
          {Icon ? <Icon className="h-5 w-5 shrink-0 text-zg-text-muted" strokeWidth={2} aria-hidden /> : null}
          {title}
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm text-zg-text-muted">{description}</p>
      </header>
      {children}
    </section>
  );
}
