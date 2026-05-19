"use client";

import Toggle from "@/src/components/ui/toggle";
import { cn } from "@/src/lib/utils";
import type { DisplayToggleOption } from "@/src/lib/public-page/section-display";

type SectionDisplayTogglesProps<T extends Record<string, boolean>> = {
  title?: string;
  description?: string;
  display: T;
  options: DisplayToggleOption[];
  /** Valeurs sources pour masquer les toggles `hideWhenEmpty`. */
  availability?: Record<string, boolean>;
  onChange: (key: keyof T & string, value: boolean) => void;
  className?: string;
};

export default function SectionDisplayToggles<T extends Record<string, boolean>>({
  title = "Affichage",
  description = "Choisissez ce qui est visible sur votre showroom :",
  display,
  options,
  availability = {},
  onChange,
  className,
}: SectionDisplayTogglesProps<T>) {
  const visibleOptions = options.filter((opt) => {
    if (!opt.hideWhenEmpty) return true;
    return availability[opt.key] !== false;
  });

  if (visibleOptions.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zg-muted">{title}</p>
        <p className="text-xs text-zg-text-muted">{description}</p>
      </div>
      <ul className="space-y-2.5">
        {visibleOptions.map((opt) => {
          const key = opt.key as keyof T & string;
          const checked = display[key];
          const dimmed = !checked;
          return (
            <li
              key={opt.key}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border border-zg-border/70 px-3 py-2.5",
                dimmed && "bg-zg-surface-soft/80",
              )}
            >
              <Toggle
                checked={checked}
                onChange={(v) => onChange(key, v)}
                label={opt.label}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
