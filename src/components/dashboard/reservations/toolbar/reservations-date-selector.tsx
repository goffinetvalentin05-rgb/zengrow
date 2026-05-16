"use client";

import { useEffect, useRef, useState } from "react";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import ReservationsDatePickerPopup from "@/src/components/dashboard/reservations/toolbar/reservations-date-picker-popup";
import {
  addCalendarDaysYmd,
  formatYmdLongFr,
} from "@/src/components/dashboard/reservations/utils/reservation-date-format";
import { calendarYmdInBusinessTz } from "@/src/lib/date/business-calendar";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

export default function ReservationsDateSelector() {
  const { daySectionDate, setDaySectionDate } = useReservations();
  const [pickerOpen, setPickerOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const todayYmd = calendarYmdInBusinessTz();
  const isToday = daySectionDate === todayYmd;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setDaySectionDate(addCalendarDaysYmd(daySectionDate, -1));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setDaySectionDate(addCalendarDaysYmd(daySectionDate, 1));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [daySectionDate, setDaySectionDate]);

  return (
    <div className="relative flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="rounded-xl border border-zg-border p-2.5 text-zg-muted transition-colors hover:border-zg-border-hover hover:bg-zg-card-hover hover:text-zg-fg"
          aria-label="Jour précédent"
          onClick={() => setDaySectionDate(addCalendarDaysYmd(daySectionDate, -1))}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="rounded-xl border border-zg-border p-2.5 text-zg-muted transition-colors hover:border-zg-border-hover hover:bg-zg-card-hover hover:text-zg-fg"
          aria-label="Jour suivant"
          onClick={() => setDaySectionDate(addCalendarDaysYmd(daySectionDate, 1))}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setPickerOpen((o) => !o)}
        className={cn(
          "flex min-w-0 items-center gap-2 rounded-xl border border-zg-border px-3 py-2 text-left transition-colors sm:px-4 sm:py-2.5",
          "hover:border-zg-border-hover hover:bg-zg-card-hover",
          pickerOpen && "border-zg-accent/50 bg-zg-accent-soft-bg",
        )}
        aria-expanded={pickerOpen}
        aria-haspopup="dialog"
      >
        <CalendarDays className="h-5 w-5 shrink-0 text-zg-accent" aria-hidden />
        <span className="truncate text-base font-semibold text-zg-fg sm:text-lg">
          {formatYmdLongFr(daySectionDate)}
        </span>
      </button>

      <Button
        type="button"
        variant={isToday ? "secondary" : "ghost"}
        size="sm"
        className="shrink-0"
        disabled={isToday}
        onClick={() => setDaySectionDate(todayYmd)}
      >
        Aujourd&apos;hui
      </Button>

      <ReservationsDatePickerPopup
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedYmd={daySectionDate}
        onSelectYmd={setDaySectionDate}
        anchorRef={triggerRef}
      />
    </div>
  );
}
