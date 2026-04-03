import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

type StatAccent = "primary" | "amber" | "stone";

const accentBar: Record<StatAccent, string> = {
  primary: "bg-[var(--primary)]",
  amber: "bg-[var(--accent-amber)]",
  stone: "bg-stone-400",
};

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: StatAccent;
};

export default function StatCard({ label, value, icon: Icon, accent = "primary" }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] bg-[var(--surface-card)] pl-5 pr-5 pt-6 pb-6 shadow-[var(--card-shadow)] transition-shadow duration-200 hover:shadow-[var(--card-shadow-hover)]",
        "border border-[var(--border-soft)]",
      )}
    >
      <div
        className={cn("absolute left-0 top-5 bottom-5 w-1 rounded-full", accentBar[accent])}
        aria-hidden
      />
      <div className="pl-4">
        <div className="flex items-start justify-between gap-3">
          <p className="max-w-[75%] text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-[var(--muted-foreground)]">
            {label}
          </p>
          <Icon className="h-5 w-5 shrink-0 text-[var(--muted-foreground)]/55" strokeWidth={1.75} aria-hidden />
        </div>
        <p className="mt-3 text-[52px] font-bold leading-none tracking-tight text-[var(--foreground)] tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}
