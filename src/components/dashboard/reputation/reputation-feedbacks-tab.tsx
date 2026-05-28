"use client";

import { FeedbacksProvider } from "@/src/components/dashboard/feedbacks/context/feedbacks-provider";
import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";
import FeedbacksEmptyState from "@/src/components/dashboard/feedbacks/empty/feedbacks-empty-state";
import FeedbacksKpiCards from "@/src/components/dashboard/feedbacks/header/feedbacks-kpi-cards";
import FeedbacksTrendChart from "@/src/components/dashboard/feedbacks/chart/feedbacks-trend-chart";
import FeedbacksToolbar from "@/src/components/dashboard/feedbacks/toolbar/feedbacks-toolbar";
import FeedbacksListShell from "@/src/components/dashboard/feedbacks/list/feedbacks-list-shell";
import FeedbackDetailModal from "@/src/components/dashboard/feedbacks/detail/feedback-detail-modal";
import type { FeedbacksPageProps } from "@/src/components/dashboard/feedbacks/types";

function ReputationFeedbacksContent() {
  const { feedbacks } = useFeedbacks();
  const hasFeedbacks = feedbacks.length > 0;

  return (
    <section className="w-full min-w-0 space-y-6 md:space-y-8">
      <p className="text-sm text-zg-text-muted">
        Retours laissés par vos clients après une expérience moyenne ou à améliorer. Analysez-les avec l&apos;IA
        pour réagir rapidement.
      </p>

      {hasFeedbacks ? (
        <div className="space-y-6 md:space-y-8">
          <FeedbacksKpiCards />
          <FeedbacksTrendChart />
          <FeedbacksToolbar />
          <FeedbacksListShell />
        </div>
      ) : (
        <FeedbacksEmptyState />
      )}

      <FeedbackDetailModal />
    </section>
  );
}

export default function ReputationFeedbacksTab({ canUseAI = false, ...props }: FeedbacksPageProps) {
  return (
    <FeedbacksProvider canUseAI={canUseAI} {...props}>
      <ReputationFeedbacksContent />
    </FeedbacksProvider>
  );
}
