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
      className={cn(surface.paddingY, surface.width === "full" ? "w-full" : "")}
      style={{
        backgroundColor: surface.backgroundColor,
        color: surface.color,
        borderColor: surface.borderColor,
      }}
    >
      <div
        className={cn(
          surface.width === "contained" && "mx-auto max-w-6xl px-4 sm:px-6 md:px-10 lg:px-12",
          className,
        )}
      >
        {children}
      </div>
    </section>
  );
}
