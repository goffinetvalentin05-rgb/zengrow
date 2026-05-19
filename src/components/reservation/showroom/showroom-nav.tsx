"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/src/lib/utils";

const LINKS = [
  { id: "ambiance", label: "Ambiance" },
  { id: "signature", label: "Carte" },
  { id: "avis", label: "Avis" },
  { id: "infos", label: "Infos" },
  { id: "reservation", label: "Réserver" },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function ShowroomNav({
  restaurantName,
  visible,
  previewMode = false,
}: {
  restaurantName: string;
  visible: boolean;
  previewMode?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (previewMode) return;
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [previewMode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!visible) return null;

  return (
    <>
      <header
        className={cn(
          "z-40 w-full transition-[background,backdrop-filter] duration-500",
          previewMode ? "sticky top-0" : "fixed inset-x-0 top-0",
          scrolled
            ? "bg-[color-mix(in_srgb,var(--page-bg)_75%,transparent)] backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => scrollToId("accueil")}
            className="truncate text-sm font-medium tracking-wide text-white drop-shadow-sm"
            style={{ fontFamily: "var(--heading-font)" }}
          >
            {restaurantName}
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-sm"
            aria-label="Menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      {open ? (
        <div className={cn(previewMode ? "absolute inset-0 z-50" : "fixed inset-0 z-50")}>
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Fermer"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute inset-y-0 right-0 flex w-[min(100%,300px)] flex-col bg-[var(--page-bg)] p-6 shadow-2xl"
            style={{ fontFamily: "var(--body-font)" }}
          >
            <div className="flex justify-end">
              <button type="button" onClick={() => setOpen(false)} aria-label="Fermer">
                <X className="h-5 w-5" style={{ color: "var(--heading-color)" }} />
              </button>
            </div>
            <nav className="mt-10 flex flex-col gap-5">
              {LINKS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="text-left text-lg font-medium tracking-tight"
                  style={{ color: "var(--heading-color)", fontFamily: "var(--heading-font)" }}
                  onClick={() => {
                    setOpen(false);
                    scrollToId(item.id);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
