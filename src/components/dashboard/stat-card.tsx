import type { LucideIcon } from "lucide-react";
import Skeleton from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Texte sous le chiffre (tendance ou précision). */
  trend?: string;
  trendTone?: "success" | "muted";
};

export function StatCardSkeleton() {
  return (
    <div
      className="flex h-full min-w-0 flex-col rounded-xl border border-zg-border bg-zg-surface p-5 shadow-sm"
      aria-hidden
    >
      <Skeleton className="h-8 w-8 rounded-full bg-zg-accent-soft-bg" />
      <Skeleton className="mt-4 h-3 w-[85%] max-w-[200px] bg-zg-border" />
      <Skeleton className="mt-3 h-10 w-16 max-w-full bg-zg-border" />
      <Skeleton className="mt-2 h-3 w-1/3 bg-zg-border/80" />
    </div>
  );
}

export default function StatCard({ label, value, icon: Icon, trend, trendTone = "muted" }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex h-full min-w-0 flex-col rounded-xl border border-zg-border bg-zg-surface p-5 shadow-sm",
        "transition-all duration-150",
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zg-accent-soft-bg text-zg-accent">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
      </div>
      <p className="mt-4 min-w-0 text-xs font-medium uppercase tracking-wider text-zg-text-muted break-words">
        {label}
      </p>
      <p
        className={cn(
          "zg-stat-value mt-2 min-w-0 text-4xl leading-[1.1] tracking-tight text-zg-fg break-words",
          typeof value === "string" && value.length > 6 && "text-3xl sm:text-4xl",
        )}
      >
        {value}
      </p>
      {trend ? (
        <p
          className={cn(
            "mt-1 text-xs",
            trendTone === "success" ? "font-medium text-emerald-600" : "text-zg-text-muted",
          )}
        >
          {trend}
        </p>
      ) : null}
    </div>
  );
}
