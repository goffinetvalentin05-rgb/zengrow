"use client";

import { cn } from "@/src/lib/utils";

type PanelToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description?: string;
  disabled?: boolean;
};

export default function PanelToggle({ checked, onChange, title, description, disabled }: PanelToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app",
        checked
          ? "border-zg-border-accent bg-zg-surface-elevated shadow-zg-soft"
          : "border-zg-border bg-zg-surface hover:border-zg-border-hover hover:bg-zg-card-hover",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zg-fg">{title}</p>
        {description ? <p className="mt-1 text-sm leading-relaxed text-zg-text-secondary">{description}</p> : null}
      </div>
      <span
        className={cn(
          "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-200 ease-out",
          checked ? "bg-zg-accent" : "bg-zg-border",
        )}
      >
        <span
          className={cn(
            "absolute left-1 inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
            checked ? "translate-x-6" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}
