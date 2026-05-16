"use client";

import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type CustomizationZoneProps = {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  /** Emoji ou caractère affiché avant le titre (ex. 🎨). */
  icon?: string;
};

export default function CustomizationZone({
  id,
  title,
  description,
  children,
  className,
  icon,
}: CustomizationZoneProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scroll-mt-28 rounded-2xl border border-zg-border bg-zg-surface p-5 md:p-6", className)}
    >
      <header className="mb-6 border-b border-zg-border/70 pb-4">
        <h2 id={`${id}-title`} className="text-lg font-semibold tracking-tight text-zg-fg sm:text-xl">
          {icon ? (
            <span className="mr-2" aria-hidden>
              {icon}
            </span>
          ) : null}
          {title}
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm text-zg-text-muted">{description}</p>
      </header>
      {children}
    </section>
  );
}
