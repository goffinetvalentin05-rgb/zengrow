"use client";

import { cn } from "@/src/lib/utils";
import type { SectionSurface } from "@/src/lib/public-page/theme";

type PublicPageSectionProps = {
  surface: SectionSurface;
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export function PublicPageSection({ surface, children, className, id }: PublicPageSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        surface.paddingY,
        surface.width === "full" ? "w-full" : "",
        // Transition douce entre sections : pas de “barre” blanche, un souffle vertical
        "relative isolate",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:z-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[color-mix(in_srgb,var(--body-text)_16%,transparent)] before:to-transparent",
      )}
      style={{
        backgroundColor: surface.backgroundColor,
        color: surface.color,
        borderColor: surface.borderColor,
      }}
    >
      <div
        className={cn(
          "relative z-[1]",
          surface.width === "contained" && "mx-auto max-w-6xl px-4 sm:px-6 md:px-10 lg:px-12",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}
