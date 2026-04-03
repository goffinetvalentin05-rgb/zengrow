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
        "flex w-full items-center justify-between gap-4 rounded-lg border px-5 py-4 text-left transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600/25 focus-visible:ring-offset-2",
        checked ? "border-green-200 bg-green-50/60" : "border-gray-200 bg-white hover:bg-gray-50/80",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {description ? <p className="mt-1 text-sm leading-relaxed text-gray-500">{description}</p> : null}
      </div>
      <span
        className={cn(
          "relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-green-600" : "bg-gray-300",
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
