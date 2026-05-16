"use client";

import { FeedbacksProvider } from "@/src/components/dashboard/feedbacks/context/feedbacks-provider";
import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";
import FeedbacksEmptyState from "@/src/components/dashboard/feedbacks/empty/feedbacks-empty-state";
import FeedbacksHeader from "@/src/components/dashboard/feedbacks/header/feedbacks-header";
import FeedbacksKpiCards from "@/src/components/dashboard/feedbacks/header/feedbacks-kpi-cards";
import type { FeedbacksPageProps } from "@/src/components/dashboard/feedbacks/types";

function FeedbacksPageContent() {
  const { feedbacks } = useFeedbacks();
  const hasFeedbacks = feedbacks.length > 0;

  return (
    <section className="w-full min-w-0 space-y-8 md:space-y-12">
      <FeedbacksHeader />
      <FeedbacksKpiCards />
      {!hasFeedbacks ? <FeedbacksEmptyState /> : null}
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
