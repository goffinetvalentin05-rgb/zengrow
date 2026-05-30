"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { DashboardThemePreference } from "@/src/lib/dashboard/theme";
import { useLandingCanvas } from "@/components/zg-landing/landing-canvas-provider";

const OPTIONS: {
  value: DashboardThemePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "auto", label: "Fond automatique", icon: Monitor },
  { value: "light", label: "Fond clair", icon: Sun },
  { value: "dark", label: "Fond sombre", icon: Moon },
];

type LandingCanvasToggleProps = {
  className?: string;
  /** Version compacte pour la barre de navigation. */
  compact?: boolean;
};

export function LandingCanvasToggle({ className, compact = false }: LandingCanvasToggleProps) {
  const { preference, setPreference } = useLandingCanvas();

  return (
    <div
      className={cn(
        "flex items-center rounded-full border border-white/10 bg-white/[0.04] p-0.5",
        compact ? "gap-0" : "gap-0.5",
        className,
      )}
      role="group"
      aria-label="Fond de la page"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setPreference(value)}
            className={cn(
              "inline-flex items-center justify-center rounded-full transition-colors duration-200",
              compact ? "h-8 w-8" : "h-9 w-9",
              active
                ? "bg-[#7c5cff] text-white shadow-[0_0_16px_-4px_rgba(124,92,255,0.55)]"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            )}
            aria-pressed={active}
            aria-label={label}
            title={label}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
