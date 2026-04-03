"use client";

import { cn } from "@/src/lib/utils";

type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
};

export default function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-3",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200",
          "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(13,92,74,0.15)]",
          checked ? "bg-[var(--primary)]" : "bg-[rgba(0,0,0,0.14)]",
        )}
      >
        <span
          className={cn(
            "inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-1 ring-black/[0.04] transition-transform duration-200 ease-out",
            checked ? "translate-x-[1.375rem]" : "translate-x-0.5",
          )}
        />
      </button>
      {label && <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>}
    </label>
  );
}
