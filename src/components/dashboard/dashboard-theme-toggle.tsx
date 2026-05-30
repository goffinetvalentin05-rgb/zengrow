"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/src/lib/utils";
import {
  DASHBOARD_THEME_PREFERENCES,
  type DashboardThemePreference,
} from "@/src/lib/dashboard/theme";
import { useDashboardTheme } from "@/src/components/dashboard/dashboard-theme-provider";

const OPTIONS: {
  value: DashboardThemePreference;
  label: string;
  shortLabel: string;
  icon: typeof Sun;
}[] = [
  { value: "auto", label: "Automatique", shortLabel: "Auto", icon: Monitor },
  { value: "light", label: "Clair", shortLabel: "Clair", icon: Sun },
  { value: "dark", label: "Sombre", shortLabel: "Sombre", icon: Moon },
];

type DashboardThemeToggleProps = {
  /** Grille 3 icônes pour la sidebar (évite le débordement). */
  variant?: "default" | "sidebar" | "sidebarCompact";
  className?: string;
};

export function DashboardThemeToggle({
  variant = "default",
  className,
}: DashboardThemeToggleProps) {
  const { preference, setPreference } = useDashboardTheme();

  if (variant === "sidebar" || variant === "sidebarCompact") {
    const compact = variant === "sidebarCompact";
    return (
      <div
        className={cn(
          "grid w-full gap-1",
          compact ? "grid-cols-1" : "grid-cols-3",
          className,
        )}
        role="group"
        aria-label="Thème de l'interface"
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = preference === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setPreference(value)}
              className={cn(
                "inline-flex items-center justify-center rounded-lg transition-colors duration-200",
                compact ? "h-9 w-9" : "h-8 min-w-0 px-1",
                active
                  ? "bg-zg-accent text-white shadow-sm"
                  : "text-zg-on-dark-muted hover:bg-zg-sidebar-hover hover:text-zg-on-dark",
              )}
              aria-pressed={active}
              aria-label={label}
              title={label}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="dashboard-field-label">Apparence de l&apos;interface</p>
      <div
        className="inline-flex w-full max-w-md rounded-xl border border-zg-border bg-zg-surface p-1"
        role="group"
        aria-label="Thème de l'interface"
      >
        {OPTIONS.map(({ value, label, shortLabel, icon: Icon }) => {
          const active = preference === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setPreference(value)}
              className={cn(
                "flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-zg-accent text-white shadow-sm"
                  : "text-zg-text-muted hover:bg-zg-card-hover hover:text-zg-fg",
              )}
              aria-pressed={active}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{shortLabel}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs leading-relaxed text-zg-text-muted">
        {preference === "auto"
          ? "Le fond suit votre appareil ; textes et cartes restent en thème sombre."
          : preference === "light"
            ? "Interface claire, optimisée pour une utilisation en journée."
            : "Interface sombre ZenGrow, idéale en soirée."}
      </p>
    </div>
  );
}

export function isDashboardThemePreferenceValue(value: string): value is DashboardThemePreference {
  return DASHBOARD_THEME_PREFERENCES.includes(value as DashboardThemePreference);
}
