"use client";

import { cn } from "@/src/lib/utils";

const ITEMS = [
  { id: "clients" as const, label: "Clients" },
  { id: "rewards" as const, label: "Récompenses" },
];

type LoyaltySectionNavProps = {
  value: "clients" | "rewards";
  onChange: (value: "clients" | "rewards") => void;
};

export default function LoyaltySectionNav({ value, onChange }: LoyaltySectionNavProps) {
  return (
    <nav aria-label="Section fidélité" className="inline-flex rounded-xl border border-zg-border bg-zg-surface-elevated/80 p-1 backdrop-blur-sm">
      {ITEMS.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 ease-out",
              active
                ? "bg-gradient-to-br from-[#7c5cff] to-[#6366f1] text-white shadow-[0_0_24px_-8px_rgba(124,92,255,0.55)]"
                : "text-zg-text-muted hover:bg-white/5 hover:text-zg-fg",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
