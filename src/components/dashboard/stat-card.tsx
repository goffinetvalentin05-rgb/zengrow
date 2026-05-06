import type { LucideIcon } from "lucide-react";
import Skeleton from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

type StatAccent = "primary" | "amber" | "stone";

const accentBar: Record<StatAccent, string> = {
  primary: "bg-zg-mint",
  amber: "bg-amber-400",
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
        "flex gap-4 rounded-2xl border border-zg-border-strong/88 bg-zg-surface/92 p-6 shadow-zg-card backdrop-blur-md",
        "min-h-0 min-w-0",
      )}
      aria-hidden
    >
      <Skeleton className="mt-0.5 h-14 w-1 shrink-0 self-start rounded-full bg-[#3DBE9F]/35" />
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-3 w-2/3 max-w-[180px] bg-[#0F3F3A]/10" />
        <Skeleton className="h-10 w-16 max-w-full bg-[#0F3F3A]/10" />
      </div>
      <Skeleton className="mt-1 h-5 w-5 shrink-0 rounded-md bg-[#1F7A6C]/15" />
    </div>
  );
}

export default function StatCard({ label, value, icon: Icon, accent = "primary" }: StatCardProps) {
  const isText = typeof value === "string" && value.includes("·");
  return (
    <div
      className={cn(
        "flex gap-4 rounded-2xl border border-zg-border-strong/88 bg-zg-surface/92 p-4 shadow-zg-soft backdrop-blur-md",
        "min-h-0 min-w-0",
      )}
    >
      <div className={cn("mt-0.5 h-14 w-1 shrink-0 self-start rounded-full", accentBar[accent])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zg-fg/48">{label}</p>
        <p
          className={cn(
            "mt-2 font-bold tracking-tight text-zg-fg",
            isText ? "text-lg leading-snug sm:text-xl" : "text-3xl tabular-nums",
          )}
        >
          {value}
        </p>
      </div>
      <Icon className="mt-1 h-5 w-5 shrink-0 text-zg-teal/50" strokeWidth={1.75} aria-hidden />
    </div>
  );
}
