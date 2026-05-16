"use client";

import FeedbacksAverageRatingKpi from "@/src/components/dashboard/feedbacks/header/feedbacks-average-rating-kpi";
import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";
import {
  formatPendingSubline,
  formatResponseRateSubline,
  formatTotalFeedbacksSubline,
} from "@/src/components/dashboard/feedbacks/utils/feedback-kpis";
import ReservationsKpiCard from "@/src/components/dashboard/reservations/header/reservations-kpi-card";
import { cn } from "@/src/lib/utils";
import { CalendarDays, Inbox } from "lucide-react";

export default function FeedbacksKpiCards() {
  const { kpis } = useFeedbacks();
  const pendingHighlight = kpis.pendingCount > 0;

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6"
      aria-labelledby="feedbacks-kpi-heading"
    >
      <h2 id="feedbacks-kpi-heading" className="sr-only">
        Indicateurs feedbacks
      </h2>
      <FeedbacksAverageRatingKpi
        averageRating={kpis.averageRating}
        totalFeedbacks={kpis.totalFeedbacks}
        subline={formatTotalFeedbacksSubline(kpis.totalFeedbacks)}
        trend={kpis.ratingMonthTrend.label}
        trendTone={kpis.ratingMonthTrend.tone}
      />
      <ReservationsKpiCard
        label="Feedbacks ce mois"
        value={kpis.feedbacksThisMonth}
        subline={formatResponseRateSubline(kpis.responseRatePercent, kpis.servedReservationsThisMonth)}
        icon={CalendarDays}
        dataTone="info"
      />
      <ReservationsKpiCard
        label="À traiter"
        value={kpis.pendingCount}
        subline={formatPendingSubline(kpis.lowRatingPendingCount)}
        icon={Inbox}
        dataTone={pendingHighlight ? "warning" : "accent"}
        className={cn(
          pendingHighlight &&
            "border-zg-warning/35 bg-zg-warning-soft-bg/30 hover:border-zg-warning/50 hover:bg-zg-warning-soft-bg/40",
        )}
        sublineClassName={kpis.lowRatingPendingCount > 0 ? "text-zg-warning font-medium" : undefined}
      />
    </div>
  );
}
