"use client";

import { useEffect, useRef, useState } from "react";
import { calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";
import {
  formatYmdMonthYearFr,
  monthGridWeeks,
  shiftYmdMonth,
} from "@/src/components/dashboard/reservations/utils/reservation-date-format";
import { cn } from "@/src/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

type ReservationsDatePickerPopupProps = {
  open: boolean;
  onClose: () => void;
  selectedYmd: string;
  onSelectYmd: (ymd: string) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
};

export default function ReservationsDatePickerPopup({
  open,
  onClose,
  selectedYmd,
  onSelectYmd,
  anchorRef,
}: ReservationsDatePickerPopupProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [viewYmd, setViewYmd] = useState(selectedYmd);
  const todayYmd = calendarYmdInBusinessTz();

  useEffect(() => {
    if (open) setViewYmd(selectedYmd);
  }, [open, selectedYmd]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  const weeks = monthGridWeeks(viewYmd);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Choisir une date"
      className="absolute left-0 top-full z-50 mt-2 w-[min(100vw-2rem,320px)] rounded-2xl border border-zg-border bg-zg-surface-elevated p-4 shadow-xl"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          className="rounded-lg p-2 text-zg-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg"
          aria-label="Mois précédent"
          onClick={() => setViewYmd((v) => shiftYmdMonth(v, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-zg-fg">{formatYmdMonthYearFr(viewYmd)}</p>
        <button
          type="button"
          className="rounded-lg p-2 text-zg-muted transition-colors hover:bg-zg-card-hover hover:text-zg-fg"
          aria-label="Mois suivant"
          onClick={() => setViewYmd((v) => shiftYmdMonth(v, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wider text-zg-text-muted">
        {WEEKDAY_LABELS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="mt-1 space-y-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((cell) => {
              const isSelected = cell.ymd === selectedYmd;
              const isToday = cell.ymd === todayYmd;
              return (
                <button
                  key={cell.ymd}
                  type="button"
                  onClick={() => {
                    onSelectYmd(cell.ymd);
                    onClose();
                  }}
                  className={cn(
                    "aspect-square rounded-lg text-sm tabular-nums transition-colors",
                    !cell.inMonth && "text-zg-text-muted/50",
                    cell.inMonth && "text-zg-fg hover:bg-zg-card-hover",
                    isToday && "ring-1 ring-zg-accent/60",
                    isSelected && "bg-zg-accent text-white hover:bg-zg-accent-hover",
                  )}
                >
                  {cell.dayNum}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
