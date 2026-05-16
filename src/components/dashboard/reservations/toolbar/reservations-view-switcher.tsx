"use client";

import { useEffect } from "react";
import { useReservations } from "@/src/components/dashboard/reservations/context/use-reservations";
import type { ReservationViewMode } from "@/src/components/dashboard/reservations/types";
import { useIsMdUp } from "@/src/hooks/use-is-md-up";
import { cn } from "@/src/lib/utils";
import { Calendar, LayoutList, Timer } from "lucide-react";

const VIEW_OPTIONS: {
  mode: ReservationViewMode;
  label: string;
  icon: typeof LayoutList;
  shortcut: string;
}[] = [
  { mode: "list", label: "Liste", icon: LayoutList, shortcut: "1" },
  { mode: "timeline", label: "Timeline", icon: Timer, shortcut: "2" },
  { mode: "calendar", label: "Calendrier", icon: Calendar, shortcut: "3" },
];

export default function ReservationsViewSwitcher() {
  const { viewMode, setViewMode } = useReservations();
  const isMdUp = useIsMdUp();

  useEffect(() => {
    if (!isMdUp && viewMode !== "list") {
      setViewMode("list");
    }
  }, [isMdUp, viewMode, setViewMode]);

  return (
    <div
      role="tablist"
      aria-label="Mode d'affichage"
      className="inline-flex rounded-xl border border-zg-border bg-zg-surface p-1"
    >
      {VIEW_OPTIONS.map(({ mode, label, icon: Icon, shortcut }) => {
        const disabled = !isMdUp && mode !== "list";
        const active = viewMode === mode;
        return (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={active}
            aria-disabled={disabled}
            disabled={disabled}
            title={disabled ? "Disponible sur tablette et desktop" : `Raccourci ${shortcut}`}
            onClick={() => setViewMode(mode)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              disabled && "cursor-not-allowed opacity-40",
              active
                ? "bg-zg-accent text-white shadow-sm"
                : "text-zg-text-muted hover:bg-zg-card-hover hover:text-zg-fg",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
