"use client";

import FeedbacksList from "@/src/components/dashboard/feedbacks/list/feedbacks-list";

export default function FeedbacksListShell() {
  return (
    <section aria-labelledby="feedbacks-list-heading" className="w-full min-w-0">
      <h2 id="feedbacks-list-heading" className="sr-only">
        Liste des feedbacks
      </h2>
      <FeedbacksList />
    </section>
  );
}
