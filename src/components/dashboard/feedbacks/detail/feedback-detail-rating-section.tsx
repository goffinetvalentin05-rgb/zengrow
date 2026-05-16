"use client";

import FeedbackDetailSection from "@/src/components/dashboard/feedbacks/detail/feedback-detail-section";
import FeedbackStars from "@/src/components/dashboard/feedbacks/ui/feedback-stars";
import type { FeedbackRatingCriteria } from "@/src/components/dashboard/feedbacks/types";

const CRITERIA_LABELS: Record<keyof FeedbackRatingCriteria, string> = {
  cuisine: "Cuisine",
  service: "Service",
  ambiance: "Ambiance",
};

type FeedbackDetailRatingSectionProps = {
  rating: number;
  criteria?: FeedbackRatingCriteria | null;
};

export default function FeedbackDetailRatingSection({
  rating,
  criteria,
}: FeedbackDetailRatingSectionProps) {
  const entries = criteria
    ? (Object.entries(criteria) as [keyof FeedbackRatingCriteria, number][]).filter(
        ([, value]) => typeof value === "number" && value >= 1 && value <= 5,
      )
    : [];

  return (
    <FeedbackDetailSection title="Note">
      <div className="flex flex-wrap items-center gap-3">
        <FeedbackStars value={rating} size="lg" />
        <span className="text-2xl font-semibold tabular-nums text-zg-fg">{rating} / 5</span>
      </div>
      {entries.length > 0 ? (
        <ul className="mt-2 space-y-2 rounded-xl border border-zg-border bg-zg-surface-elevated/50 p-3">
          {entries.map(([key, value]) => (
            <li key={key} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-zg-text-muted">{CRITERIA_LABELS[key]}</span>
              <span className="flex items-center gap-2 font-medium text-zg-fg">
                <FeedbackStars value={value} size="sm" />
                <span className="tabular-nums">{value}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </FeedbackDetailSection>
  );
}
