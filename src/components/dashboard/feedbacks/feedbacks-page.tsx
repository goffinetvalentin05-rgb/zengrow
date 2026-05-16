"use client";

import { FeedbacksProvider } from "@/src/components/dashboard/feedbacks/context/feedbacks-provider";
import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";
import FeedbacksEmptyState from "@/src/components/dashboard/feedbacks/empty/feedbacks-empty-state";
import FeedbacksHeader from "@/src/components/dashboard/feedbacks/header/feedbacks-header";
import FeedbacksKpiCards from "@/src/components/dashboard/feedbacks/header/feedbacks-kpi-cards";
import FeedbacksTrendChart from "@/src/components/dashboard/feedbacks/chart/feedbacks-trend-chart";
import FeedbacksToolbar from "@/src/components/dashboard/feedbacks/toolbar/feedbacks-toolbar";
import FeedbacksListShell from "@/src/components/dashboard/feedbacks/list/feedbacks-list-shell";
import FeedbackDetailModal from "@/src/components/dashboard/feedbacks/detail/feedback-detail-modal";
import type { FeedbacksPageProps } from "@/src/components/dashboard/feedbacks/types";

function FeedbacksPageContent() {
  const { feedbacks } = useFeedbacks();
  const hasFeedbacks = feedbacks.length > 0;

  return (
    <section className="w-full min-w-0 space-y-6 pb-[max(1rem,env(safe-area-inset-bottom))] md:space-y-10 lg:space-y-12">
      <FeedbacksHeader />

      {hasFeedbacks ? (
        <div className="space-y-6 md:space-y-8 lg:space-y-10">
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

export default function FeedbacksPage(props: FeedbacksPageProps) {
  return (
    <FeedbacksProvider {...props}>
      <FeedbacksPageContent />
    </FeedbacksProvider>
  );
}
