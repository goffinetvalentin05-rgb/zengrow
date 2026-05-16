"use client";

import FeedbacksEmptySearch from "@/src/components/dashboard/feedbacks/empty/feedbacks-empty-search";
import FeedbackListRow from "@/src/components/dashboard/feedbacks/list/feedback-list-row";
import { useFeedbacks } from "@/src/components/dashboard/feedbacks/context/use-feedbacks";

export default function FeedbacksList() {
  const { feedbacks, filteredFeedbacks } = useFeedbacks();

  if (feedbacks.length === 0) return null;

  if (filteredFeedbacks.length === 0) {
    return <FeedbacksEmptySearch />;
  }

  return (
    <ul className="w-full min-w-0 space-y-2 md:space-y-2.5" role="list">
      {filteredFeedbacks.map((feedback) => (
        <li key={feedback.id}>
          <FeedbackListRow feedback={feedback} />
        </li>
      ))}
    </ul>
  );
}
