"use client";

import { cn } from "@/src/lib/utils";

type TabsProps = {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

export default function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="inline-flex rounded-xl border border-zg-border bg-zg-surface-elevated/60 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 ease-out",
            tab.id === value
              ? "bg-zg-accent text-white shadow-[0_0_24px_-8px_rgba(232,93,44,0.65)]"
              : "text-zg-text-muted hover:bg-white/5 hover:text-zg-fg",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
