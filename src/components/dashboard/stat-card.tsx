import type { LucideIcon } from "lucide-react";
import Skeleton from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

type StatAccent = "primary" | "amber" | "stone";

const accentBar: Record<StatAccent, string> = {
  primary: "bg-zg-mint",
  amber: "bg-amber-500",
  stone: "bg-zg-border-accent",
};

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: StatAccent;
  compact?: boolean;
};

export function StatCardSkeleton() {
  return (
    <div
      className={cn(
        "flex gap-4 rounded-2xl border border-zg-border bg-zg-surface p-6 shadow-zg-card",
        "min-h-0 min-w-0",
      )}
      aria-hidden
    >
      <Skeleton className="mt-0.5 h-14 w-1 shrink-0 self-start rounded-full bg-zg-teal/25" />
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-3 w-2/3 max-w-[180px] bg-zg-border/90" />
        <Skeleton className="h-10 w-16 max-w-full bg-zg-border/90" />
      </div>
      <Skeleton className="mt-1 h-5 w-5 shrink-0 rounded-md bg-zg-teal/12" />
    </div>
  );
}

export default function StatCard({ label, value, icon: Icon, accent = "primary" }: StatCardProps) {
  const isText = typeof value === "string" && value.includes("·");
  return (
    <div
      className={cn(
        "flex gap-4 rounded-2xl border border-zg-border bg-zg-surface p-4 shadow-zg-soft",
        "min-h-0 min-w-0",
      )}
    >
      <div className={cn("mt-0.5 h-14 w-1 shrink-0 self-start rounded-full", accentBar[accent])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zg-fg-muted">{label}</p>
        <p
          className={cn(
            "mt-2 font-bold tracking-tight text-zg-fg",
            isText ? "text-lg leading-snug sm:text-xl" : "text-3xl tabular-nums",
          )}
        >
          {value}
        </p>
      </div>
      <Icon className="mt-1 h-5 w-5 shrink-0 text-zg-teal/45" strokeWidth={1.75} aria-hidden />
    </div>
  );
}
