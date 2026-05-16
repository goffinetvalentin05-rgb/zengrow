import type { LucideIcon } from "lucide-react";
import type { StatDataTone } from "@/src/components/ui/stat-card";
import { cn } from "@/src/lib/utils";

const tonePill: Record<StatDataTone, string> = {
  accent: "bg-zg-accent-soft-bg text-zg-accent",
  premium: "bg-zg-premium-soft-bg text-zg-premium",
  success: "bg-zg-success-soft-bg text-zg-success",
  info: "bg-zg-info-soft-bg text-zg-info",
  warning: "bg-zg-warning-soft-bg text-zg-warning",
  danger: "bg-zg-danger-soft-bg text-zg-danger",
};

export type ReservationsKpiCardProps = {
  label: string;
  value: string | number;
  subline?: string;
  icon: LucideIcon;
  dataTone?: StatDataTone;
  progressPercent?: number;
  progressTone?: "accent" | "warning" | "danger";
  className?: string;
};

export default function ReservationsKpiCard({
  label,
  value,
  subline,
  icon: Icon,
  dataTone = "accent",
  progressPercent,
  progressTone = "accent",
  className,
}: ReservationsKpiCardProps) {
  const progressBarClass =
    progressTone === "danger"
      ? "bg-zg-danger"
      : progressTone === "warning"
        ? "bg-zg-warning"
        : "bg-zg-accent";

  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col rounded-2xl border border-zg-border bg-zg-surface p-6 transition-all duration-200 ease-out",
        "hover:border-zg-border-hover hover:bg-zg-card-hover",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
          tonePill[dataTone],
        )}
      >
        <Icon className="h-[22px] w-[22px]" strokeWidth={1.85} aria-hidden />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-zg-text-muted">{label}</p>
      <p
        className={cn(
          "zg-stat-value mt-1 text-4xl leading-none tracking-tight text-zg-fg tabular-nums sm:text-5xl",
          typeof value === "string" && value.length > 8 && "text-3xl sm:text-4xl",
        )}
      >
        {value}
      </p>
      {subline ? <p className="mt-2 text-sm leading-snug text-zg-text-muted">{subline}</p> : null}
      {progressPercent != null ? (
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zg-border/80">
          <div
            className={cn("h-full rounded-full transition-all duration-300", progressBarClass)}
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      ) : null}
    </article>
  );
}
