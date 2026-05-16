"use client";

import FeedbackStars from "@/src/components/dashboard/feedbacks/ui/feedback-stars";
import type { FeedbackKpisTrendTone } from "@/src/components/dashboard/feedbacks/utils/feedback-kpis";
import { cn } from "@/src/lib/utils";
import { Star } from "lucide-react";

const trendTextClass: Record<FeedbackKpisTrendTone, string> = {
  success: "text-zg-success",
  warning: "text-zg-warning",
  muted: "text-zg-text-muted",
};

type FeedbacksAverageRatingKpiProps = {
  averageRating: number;
  totalFeedbacks: number;
  subline: string;
  trend: string;
  trendTone: FeedbackKpisTrendTone;
};

export default function FeedbacksAverageRatingKpi({
  averageRating,
  totalFeedbacks,
  subline,
  trend,
  trendTone,
}: FeedbacksAverageRatingKpiProps) {
  const displayValue =
    totalFeedbacks > 0
      ? `${averageRating.toLocaleString("fr-CH", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} / 5`
      : "— / 5";

  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col rounded-2xl border border-zg-border bg-zg-surface p-6 transition-all duration-200 ease-out",
        "hover:border-zg-border-hover hover:bg-zg-card-hover",
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zg-warning-soft-bg text-zg-warning">
        <Star className="h-[22px] w-[22px]" strokeWidth={1.85} aria-hidden />
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-zg-text-muted">Note moyenne</p>
      <p className="zg-stat-value mt-1 text-4xl leading-none tracking-tight text-zg-fg tabular-nums sm:text-5xl">
        {displayValue}
      </p>
      <FeedbackStars value={totalFeedbacks > 0 ? averageRating : 0} size="md" className="mt-3" />
      <p className="mt-2 text-sm leading-snug text-zg-text-muted">{subline}</p>
      <p className={cn("mt-1 text-xs font-medium leading-snug", trendTextClass[trendTone])}>{trend}</p>
    </article>
  );
}
