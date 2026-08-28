"use client";

import { cn } from "@/src/lib/utils";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import type { DashboardLocale } from "@/src/locales/dashboard";

type Props = {
  variant?: "sidebar" | "default";
  className?: string;
};

export function DashboardLocaleSwitch({ variant = "default", className }: Props) {
  const { locale, setLocale, t } = useDashboardI18n();
  const options: DashboardLocale[] = ["fr", "en"];

  if (variant === "sidebar") {
    return (
      <div className={cn("grid grid-cols-2 gap-1", className)} role="group" aria-label={t.nav.locale}>
        {options.map((code) => {
          const active = locale === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={cn(
                "inline-flex h-7 items-center justify-center rounded-md text-[11px] font-semibold uppercase tracking-wide transition-colors duration-200",
                active
                  ? "bg-white/[0.1] text-zg-on-dark"
                  : "text-zg-on-dark-muted hover:bg-zg-sidebar-hover hover:text-zg-on-dark",
              )}
              aria-pressed={active}
            >
              {code}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn("inline-flex rounded-xl border border-zg-border bg-zg-surface p-1", className)}
      role="group"
      aria-label={t.nav.locale}
    >
      {options.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={cn(
              "min-h-9 rounded-lg px-3 text-xs font-semibold uppercase tracking-wide transition-colors duration-200",
              active ? "bg-white/[0.1] text-zg-fg" : "text-zg-text-muted hover:bg-white/[0.05] hover:text-zg-fg",
            )}
            aria-pressed={active}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
