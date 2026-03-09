"use client";

import { cn } from "@/src/lib/utils";

type TabsProps = {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

export default function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="inline-flex rounded-xl border bg-white p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition",
            tab.id === value ? "bg-[var(--primary)] text-white" : "text-slate-600 hover:bg-slate-100",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
