"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  PUBLIC_PAGE_EDITOR_SECTIONS,
  type PublicPageEditorSectionId,
} from "@/src/components/dashboard/public-page/public-page-editor-sections";

type PublicPageSectionNavProps = {
  className?: string;
};

export default function PublicPageSectionNav({ className }: PublicPageSectionNavProps) {
  const [activeId, setActiveId] = useState<PublicPageEditorSectionId>("zone-theme");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const sectionElements = PUBLIC_PAGE_EDITOR_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean,
    ) as HTMLElement[];

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target.id as PublicPageEditorSectionId | undefined;
        if (top) setActiveId(top);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.15, 0.35, 0.55, 0.75] },
    );

    for (const el of sectionElements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: PublicPageEditorSectionId) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
    setMobileOpen(false);
  }, []);

  const activeLabel = PUBLIC_PAGE_EDITOR_SECTIONS.find((s) => s.id === activeId)?.label ?? "Sections";

  return (
    <>
      <MobileSectionNav
        className={className}
        activeLabel={activeLabel}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        activeId={activeId}
        scrollTo={scrollTo}
      />

      <nav
        className={cn("hidden w-[220px] shrink-0 lg:block", className)}
        aria-label="Sections du showroom"
      >
        <div className="sticky top-6 space-y-0.5">
          {PUBLIC_PAGE_EDITOR_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeId === section.id;
            return (
              <button
                key={section.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition",
                  isActive
                    ? "border-l-2 border-zg-accent bg-zg-accent/10 pl-[10px] text-zg-accent"
                    : "border-l-2 border-transparent text-zg-text-muted hover:bg-zg-border/30 hover:text-zg-fg",
                )}
                aria-current={isActive ? "true" : undefined}
                onClick={() => scrollTo(section.id)}
              >
                <Icon
                  className={cn("h-5 w-5 shrink-0", isActive ? "text-zg-accent" : "text-zg-text-muted")}
                  strokeWidth={2}
                  aria-hidden
                />
                {section.label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function MobileSectionNav({
  className,
  activeLabel,
  mobileOpen,
  setMobileOpen,
  activeId,
  scrollTo,
}: {
  className?: string;
  activeLabel: string;
  mobileOpen: boolean;
  setMobileOpen: (fn: (v: boolean) => boolean) => void;
  activeId: PublicPageEditorSectionId;
  scrollTo: (id: PublicPageEditorSectionId) => void;
}) {
  return (
    <div className={cn("relative lg:hidden", className)}>
      <div className="sticky top-0 z-10 border-b border-zg-border/80 bg-zg-bg/95 px-3 py-2 backdrop-blur-md">
        <button
          type="button"
          className="flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-zg-border bg-zg-surface px-3 py-2 text-sm font-semibold text-zg-fg"
          aria-expanded={mobileOpen}
          aria-haspopup="listbox"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4 text-zg-accent" aria-hidden />
            Aller à… {activeLabel}
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 transition", mobileOpen && "rotate-180")} aria-hidden />
        </button>
      </div>
      {mobileOpen ? (
        <div
          className="absolute left-3 right-3 top-full z-20 mt-1 rounded-xl border border-zg-border bg-zg-surface p-1.5 shadow-lg"
          role="listbox"
        >
          {PUBLIC_PAGE_EDITOR_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeId === section.id;
            return (
              <button
                key={section.id}
                type="button"
                role="option"
                aria-selected={isActive}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                  isActive ? "bg-zg-accent/15 text-zg-accent" : "text-zg-fg hover:bg-zg-border/40",
                )}
                onClick={() => scrollTo(section.id)}
              >
                <Icon
                  className={cn("h-5 w-5 shrink-0", isActive ? "text-zg-accent" : "text-zg-text-muted")}
                  strokeWidth={2}
                  aria-hidden
                />
                {section.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
