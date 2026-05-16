"use client";

import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type CustomizationZoneProps = {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
};

export default function CustomizationZone({ id, title, description, children, className }: CustomizationZoneProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scroll-mt-24 rounded-2xl border border-zg-border bg-zg-surface p-5 md:p-6", className)}
    >
      <header className="mb-5 border-b border-zg-border/70 pb-4">
        <h2 id={`${id}-title`} className="text-base font-semibold text-zg-fg sm:text-lg">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-zg-text-muted">{description}</p>
      </header>
      {children}
    </section>
  );
}
