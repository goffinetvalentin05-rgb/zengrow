import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Skeleton from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

export type StatDataTone = "accent" | "premium" | "success" | "info" | "warning" | "danger";

const tonePill: Record<StatDataTone, string> = {
  accent: "bg-zg-accent-soft-bg text-zg-accent",
  premium: "bg-zg-premium-soft-bg text-zg-premium",
  success: "bg-zg-success-soft-bg text-zg-success",
  info: "bg-zg-info-soft-bg text-zg-info",
  warning: "bg-zg-warning-soft-bg text-zg-warning",
  danger: "bg-zg-danger-soft-bg text-zg-danger",
};

const trendBadgeClass: Record<"success" | "danger" | "muted", string> = {
  success: "bg-zg-success-soft-bg text-zg-success",
  danger: "bg-zg-danger-soft-bg text-zg-danger",
  muted: "bg-zg-neutral-badge-bg text-zg-text-muted",
};

export type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  /** Pastille autour de l’icône (sémantique données). */
  dataTone?: StatDataTone;
  trend?: string;
  trendTone?: "success" | "danger" | "muted";
  className?: string;
};

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "zg-premium-card flex h-full min-w-0 justify-between p-6 transition-all duration-200 ease-out",
        className,
      )}
      aria-hidden
    >
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <Skeleton className="h-11 w-11 shrink-0 rounded-full bg-zg-accent-soft-bg" />
        <Skeleton className="mt-4 h-3 w-[72%] max-w-[200px] bg-zg-border" />
        <Skeleton className="mt-3 h-10 w-20 max-w-full bg-zg-border" />
      </div>
      <Skeleton className="mt-1 h-6 w-14 shrink-0 rounded-full bg-zg-neutral-badge-bg" />
    </div>
  );
}

export type StatCardHighlightProps = {
  label: string;
  value: ReactNode;
  subInfo?: string;
  variant?: "accent" | "success";
  className?: string;
};

export function StatCardHighlight({
  label,
  value,
  subInfo,
  variant = "accent",
  className,
}: StatCardHighlightProps) {
  const isAccent = variant === "accent";
  return (
    <div
      className={cn(
        "relative isolate flex h-full min-h-[220px] min-w-0 flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-200 ease-out",
        isAccent
          ? "border-white/[0.12] bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent text-zg-fg shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]"
          : "border-emerald-400/25 bg-zg-success-soft-bg text-zg-fg shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10 opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full border border-white/10 opacity-25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_55%)]"
        aria-hidden
      />

      <p className="relative font-landing-serif text-xl italic leading-none text-zg-fg">Sharpz</p>
      <p className="relative mt-auto text-sm font-medium text-zg-text-secondary">{label}</p>
      <p
        className={cn(
          "zg-stat-value relative mt-2 text-5xl leading-none tracking-tight text-zg-fg tabular-nums sm:text-6xl",
          typeof value === "string" && String(value).length > 5 && "text-4xl sm:text-5xl",
        )}
      >
        {value}
      </p>
      {subInfo ? <p className="relative mt-3 text-xs font-medium text-zg-muted">{subInfo}</p> : null}
    </div>
  );
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  dataTone = "accent",
  trend,
  trendTone = "muted",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "zg-premium-card flex h-full min-w-0 justify-between gap-4 p-6 transition-all duration-200 ease-out",
        "hover:border-zg-border-hover hover:bg-zg-card-hover",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col items-start">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ease-out",
            tonePill[dataTone],
          )}
        >
          <Icon className="h-[22px] w-[22px]" strokeWidth={1.85} aria-hidden />
        </div>
        <p className="mt-4 min-w-0 text-xs font-medium uppercase tracking-wider text-zg-text-muted break-words">
          {label}
        </p>
        <p
          className={cn(
            "zg-stat-value mt-1 min-w-0 text-4xl leading-none tracking-tight text-zg-fg tabular-nums sm:text-5xl break-words",
            typeof value === "string" && value.length > 6 && "text-3xl sm:text-4xl",
          )}
        >
          {value}
        </p>
      </div>
      {trend ? (
        <span
          className={cn(
            "h-fit shrink-0 rounded-full px-2 py-1 text-xs font-medium transition-colors duration-200 ease-out",
            trendBadgeClass[trendTone],
          )}
        >
          {trend}
        </span>
      ) : null}
    </div>
  );
}
