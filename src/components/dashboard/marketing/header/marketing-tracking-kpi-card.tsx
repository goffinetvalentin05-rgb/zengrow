"use client";

import type { LucideIcon } from "lucide-react";
import type { StatDataTone } from "@/src/components/ui/stat-card";
import { cn } from "@/src/lib/utils";
import { ChevronRight } from "lucide-react";

const tonePill: Record<StatDataTone, string> = {
  accent: "bg-zg-accent-soft-bg text-zg-accent",
  premium: "bg-zg-premium-soft-bg text-zg-premium",
  success: "bg-zg-success-soft-bg text-zg-success",
  info: "bg-zg-info-soft-bg text-zg-info",
  warning: "bg-zg-warning-soft-bg text-zg-warning",
  danger: "bg-zg-danger-soft-bg text-zg-danger",
};

type MarketingTrackingKpiCardProps = {
  label: string;
  icon: LucideIcon;
  dataTone?: StatDataTone;
  onActivate: () => void;
  className?: string;
};

export default function MarketingTrackingKpiCard({
  label,
  icon: Icon,
  dataTone = "info",
  onActivate,
  className,
}: MarketingTrackingKpiCardProps) {
  return (
    <button
      type="button"
      onClick={onActivate}
      className={cn(
        "group flex h-full min-w-0 w-full flex-col rounded-2xl border border-dashed border-zg-border bg-zg-surface p-5 text-left transition-all duration-200 ease-out sm:p-6",
        "hover:border-zg-accent/40 hover:bg-zg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent focus-visible:ring-offset-2 focus-visible:ring-offset-zg-bg",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            tonePill[dataTone],
          )}
        >
          <Icon className="h-[22px] w-[22px]" strokeWidth={1.85} aria-hidden />
        </div>
        <ChevronRight
          className="mt-1 h-4 w-4 shrink-0 text-zg-text-muted transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-zg-accent"
          aria-hidden
        />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-zg-text-muted">{label}</p>
      <p className="zg-stat-value mt-1 text-2xl leading-snug tracking-tight text-zg-accent sm:text-[1.65rem]">
        Activer le tracking
      </p>
      <p className="mt-2 text-sm leading-snug text-zg-text-muted">
        Mesurez les ouvertures et les clics pour optimiser vos campagnes.
      </p>
    </button>
  );
}
