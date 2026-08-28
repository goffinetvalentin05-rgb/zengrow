"use client";

import { cn } from "@/src/lib/utils";

type TabsProps = {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

export default function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="inline-flex rounded-full border border-zg-border bg-white/[0.03] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-200 ease-out",
            tab.id === value
              ? "bg-white text-zinc-950"
              : "text-zg-text-muted hover:bg-white/[0.05] hover:text-zg-fg",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
