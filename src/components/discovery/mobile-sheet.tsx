"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/src/lib/utils";
import { useI18n } from "@/src/i18n/provider";

let sheetLocks = 0;
let savedBodyOverflow = "";
let savedScrollerOverflow = "";
const closeStack: Array<() => void> = [];

function onSheetEscape(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  closeStack[closeStack.length - 1]?.();
}

export function useDiscoverySheetLock(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const scroller = document.getElementById("discovery-scroll");
    if (sheetLocks === 0) {
      savedBodyOverflow = document.body.style.overflow;
      savedScrollerOverflow = scroller?.style.overflow ?? "";
      document.body.classList.add("sz-sheet-open");
      document.body.style.overflow = "hidden";
      if (scroller) scroller.style.overflow = "hidden";
      window.addEventListener("keydown", onSheetEscape);
    }
    sheetLocks += 1;
    const close = () => onCloseRef.current();
    closeStack.push(close);
    return () => {
      const index = closeStack.lastIndexOf(close);
      if (index >= 0) closeStack.splice(index, 1);
      sheetLocks -= 1;
      if (sheetLocks > 0) return;
      sheetLocks = 0;
      document.body.classList.remove("sz-sheet-open");
      document.body.style.overflow = savedBodyOverflow;
      if (scroller) scroller.style.overflow = savedScrollerOverflow;
      window.removeEventListener("keydown", onSheetEscape);
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
  size = "md",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  labelledBy?: string;
  size?: "md" | "lg";
}) {
  const { t } = useI18n();
  useDiscoverySheetLock(open, onClose);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 flex items-end bg-black/70 md:items-center md:justify-center md:p-6",
        size === "lg" ? "z-[70]" : "z-[60]",
      )}
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={cn(
          "sz-sheet flex w-full flex-col rounded-t-3xl bg-[#121214] md:rounded-3xl",
          size === "lg"
            ? "max-h-[min(94dvh,52rem)] max-w-lg md:max-h-[min(90dvh,52rem)]"
            : "max-h-[min(92dvh,40rem)] max-w-md md:max-h-[min(86dvh,40rem)]",
        )}
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
            aria-label={t.common.close}
          >
            {t.common.close}
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
