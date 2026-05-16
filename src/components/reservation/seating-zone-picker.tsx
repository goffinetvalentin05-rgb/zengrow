"use client";

import { Home, Trees } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { ZoneSeatOptionState } from "@/src/lib/reservation/terrace-zone-availability";

type SeatingZonePickerProps = {
  interiorLabel?: string;
  terraceLabel: string;
  value: "interior" | "terrace" | null;
  onChange: (zone: "interior" | "terrace") => void;
  interiorState: ZoneSeatOptionState;
  terraceState: ZoneSeatOptionState;
  previewMode?: boolean;
  radiusClass: string;
};

function zoneCardSubtitle(state: ZoneSeatOptionState, kind: "interior" | "terrace"): string {
  if (state.available) {
    if (kind === "terrace" && state.remainingCovers > 0) {
      return state.remainingCovers > 1
        ? `${state.remainingCovers} places restantes`
        : `${state.remainingCovers} place restante`;
    }
    return kind === "interior" ? "Disponible" : "Disponible";
  }
  if (state.disabledReason === "not_enough") return "Pas assez de places";
  return "Complet";
}

export default function SeatingZonePicker({
  interiorLabel = "Salle",
  terraceLabel,
  value,
  onChange,
  interiorState,
  terraceState,
  previewMode = false,
  radiusClass,
}: SeatingZonePickerProps) {
  const options: Array<{
    zone: "interior" | "terrace";
    label: string;
    icon: typeof Home;
    state: ZoneSeatOptionState;
  }> = [
    { zone: "interior", label: interiorLabel, icon: Home, state: interiorState },
    { zone: "terrace", label: terraceLabel, icon: Trees, state: terraceState },
  ];

  return (
    <div className="flex flex-col gap-3" role="group" aria-label="Où souhaitez-vous être installé ?">
      <p className="text-center text-sm font-medium" style={{ color: "var(--heading-color)" }}>
        Où souhaitez-vous être installé ?
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map(({ zone, label, icon: Icon, state }) => {
          const selected = value === zone;
          const disabled = previewMode || !state.available;
          const subtitle = zoneCardSubtitle(state, zone);

          return (
            <button
              key={zone}
              type="button"
              disabled={disabled}
              onClick={() => onChange(zone)}
              className={cn(
                "flex min-h-[120px] flex-col items-center justify-center gap-2 border-2 px-4 py-5 text-center transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
                radiusClass,
                selected && !disabled ? "border-transparent shadow-md" : "bg-transparent",
              )}
              style={
                selected && !disabled
                  ? {
                      backgroundColor: "var(--button-bg)",
                      color: "var(--button-text)",
                      borderColor: "var(--button-bg)",
                    }
                  : {
                      borderColor: "color-mix(in srgb, var(--body-text) 22%, var(--page-bg))",
                      color: disabled
                        ? "color-mix(in srgb, var(--body-text) 45%, var(--page-bg))"
                        : "color-mix(in srgb, var(--body-text) 88%, var(--page-bg))",
                    }
              }
            >
              <Icon className="h-8 w-8 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
              <span className="text-base font-semibold">{label}</span>
              <span
                className="text-xs font-medium tabular-nums"
                style={{
                  color: selected && !disabled
                    ? "color-mix(in srgb, var(--button-text) 88%, transparent)"
                    : "color-mix(in srgb, var(--body-text) 58%, var(--page-bg))",
                }}
              >
                {subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
