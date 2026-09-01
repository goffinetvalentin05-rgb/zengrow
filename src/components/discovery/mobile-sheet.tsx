"use client";

import { useEffect } from "react";
import { cn } from "@/src/lib/utils";

export function useDiscoverySheetLock(open: boolean) {
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.classList.add("sz-sheet-open");
    document.body.style.overflow = "hidden";
    const scroller = document.getElementById("discovery-scroll");
    const previousScroller = scroller?.style.overflow ?? "";
    if (scroller) scroller.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") document.body.dispatchEvent(new Event("sz-sheet-escape"));
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("sz-sheet-open");
      document.body.style.overflow = previousOverflow;
      if (scroller) scroller.style.overflow = previousScroller;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
}

export function DiscoverySheet({
  open,
  title,
  onClose,
  children,
  footer,
  labelledBy,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  labelledBy?: string;
}) {
  useDiscoverySheetLock(open);

  useEffect(() => {
    if (!open) return;
    function onEscape() {
      onClose();
    }
    document.body.addEventListener("sz-sheet-escape", onEscape);
    return () => document.body.removeEventListener("sz-sheet-escape", onEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end bg-black/70 md:items-center md:justify-center md:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="sz-sheet flex max-h-[min(92dvh,40rem)] w-full max-w-md flex-col rounded-t-3xl bg-[#121214] md:max-h-[min(86dvh,40rem)] md:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-5">
          <h2 id={labelledBy} className="sz-title min-w-0 truncate">
            {title}
          </h2>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-sm text-white/45"
            onClick={onClose}
            aria-label="Close"
          >
            Close
          </button>
        </header>
        <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-5", !footer && "pb-[var(--sz-sheet-pad)]")}>
          {children}
        </div>
        {footer ? (
          <div className="shrink-0 border-t border-white/[0.06] px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
            {footer}
          </div>
        ) : (
          <div className="pb-[max(1rem,env(safe-area-inset-bottom,0px))]" />
        )}
      </div>
    </div>
  );
}
