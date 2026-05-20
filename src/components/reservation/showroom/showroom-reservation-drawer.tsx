"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

/** Panneau de réservation — bottom sheet mobile, side panel desktop */
export function ShowroomReservationDrawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex md:justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="showroom-reserve-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-[3px] md:bg-black/55"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "relative flex flex-col outline-none",
          /* Mobile : bottom sheet */
          "absolute inset-x-0 bottom-0 max-h-[min(92dvh,720px)] w-full",
          "rounded-t-[1.35rem] border-t border-white/10",
          "shadow-[0_-24px_80px_rgba(0,0,0,0.55)]",
          "zg-showroom-drawer-panel",
          /* Desktop : side panel droit, largeur fluide */
          "md:absolute md:inset-y-0 md:right-0 md:bottom-auto md:left-auto",
          "md:h-full md:max-h-none",
          "md:w-[440px] lg:w-[480px] xl:w-[42vw] xl:max-w-[520px]",
          "md:rounded-none md:border-t-0 md:border-l md:border-white/[0.08]",
          "md:shadow-[-24px_0_80px_rgba(0,0,0,0.45)]",
          "md:zg-showroom-drawer-panel--side",
        )}
        style={{ backgroundColor: "var(--page-bg)" }}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[color-mix(in_srgb,var(--body-text)_8%,transparent)] px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color-mix(in_srgb,var(--accent-color)_85%,transparent)]">
              Réservation
            </p>
            <h2
              id="showroom-reserve-title"
              className="mt-1 text-lg font-medium leading-tight"
              style={{ fontFamily: "var(--heading-font)", color: "var(--heading-color)" }}
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--body-text)_12%,transparent)] bg-[color-mix(in_srgb,var(--body-text)_4%,transparent)] transition hover:border-[color-mix(in_srgb,var(--accent-color)_35%,transparent)]"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" style={{ color: "var(--heading-color)" }} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-6 md:py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
