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
        "flex w-full items-center justify-between gap-4 rounded-[20px] border px-6 py-5 text-left transition-all duration-200",
        "focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]",
        checked
          ? "border-[rgba(26,107,80,0.25)] bg-[rgba(26,107,80,0.06)] shadow-[var(--card-shadow)]"
          : "border-[var(--border-soft)] bg-[var(--surface-muted)]/50 hover:bg-[var(--surface-muted)]",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-[var(--foreground)]">{title}</p>
        {description ? (
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted-foreground)]">{description}</p>
        ) : null}
      </div>
      <span
        className={cn(
          "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-200",
          checked ? "bg-[var(--primary)]" : "bg-stone-300/80",
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
