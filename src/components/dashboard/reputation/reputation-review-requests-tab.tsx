"use client";

import ReviewAutomationPanel from "@/src/components/dashboard/review-automation-panel";
import type { ReputationPageProps } from "@/src/components/dashboard/reputation/reputation-page";

type ReputationReviewRequestsTabProps = Pick<
  ReputationPageProps,
  "restaurantId" | "restaurantName" | "reviewAutomation" | "canUseAI"
>;

export default function ReputationReviewRequestsTab({
  restaurantId,
  restaurantName,
  reviewAutomation,
  canUseAI,
}: ReputationReviewRequestsTabProps) {
  return (
    <ReviewAutomationPanel
      layout="page"
      restaurantId={restaurantId}
      restaurantName={restaurantName}
      enableAiImprove
      canUseAI={canUseAI}
      initialSettings={{
        ...reviewAutomation,
        channel: "email",
      }}
      initialFeedback={[]}
    />
  );
}
