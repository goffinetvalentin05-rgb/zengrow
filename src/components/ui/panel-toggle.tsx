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
        "flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-4 text-left transition-colors duration-200",
        "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(13,92,74,0.15)]",
        checked
          ? "border-[rgba(13,92,74,0.28)] bg-[rgba(13,92,74,0.07)]"
          : "border-[rgba(0,0,0,0.07)] bg-[var(--surface-muted)]/50 hover:bg-[var(--surface-muted)]",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--foreground)]">{title}</p>
        {description ? <p className="mt-0.5 text-sm font-normal text-[var(--muted-foreground)]">{description}</p> : null}
      </div>
      <span
        className={cn(
          "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors duration-200",
          checked ? "bg-[var(--primary)]" : "bg-[rgba(0,0,0,0.12)]",
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
