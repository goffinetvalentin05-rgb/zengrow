"use client";

import { cn } from "@/src/lib/utils";

type TabsProps = {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

export default function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="inline-flex rounded-xl border border-zg-border-strong bg-zg-surface/95 p-1 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
            tab.id === value
              ? "bg-gradient-to-r from-zg-teal to-zg-mint text-white shadow-[0_6px_18px_-10px_rgba(31,122,108,0.75)]"
              : "text-zg-fg/60 hover:bg-zg-highlight/55",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
