import type { FeedbackKpis } from "@/src/components/dashboard/feedbacks/utils/feedback-kpis";

export type FeedbackRecord = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  rating: number;
  message: string | null;
  read_at: string | null;
};

export type FeedbacksPageProps = {
  feedbacks: FeedbackRecord[];
  kpis: FeedbackKpis;
};
