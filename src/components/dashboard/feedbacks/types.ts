import type { FeedbackKpis } from "@/src/components/dashboard/feedbacks/utils/feedback-kpis";

export type FeedbackRatingCriteria = {
  cuisine?: number;
  service?: number;
  ambiance?: number;
};

export type FeedbackRecord = {
  id: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
  rating: number;
  message: string | null;
  read_at: string | null;
  internal_note: string | null;
  rating_criteria: FeedbackRatingCriteria | null;
  reservation_id: string;
  reservation_date: string | null;
  customer_id: string | null;
  guests: number | null;
};

export type FeedbacksKpiMonthBounds = {
  currentMonthStart: string;
  currentMonthEnd: string;
  previousMonthStart: string;
  previousMonthEnd: string;
};

export type FeedbacksPageProps = {
  feedbacks: FeedbackRecord[];
  kpis: FeedbackKpis;
  restaurantName: string;
  servedReservationsThisMonth: number;
  kpiMonthBounds: FeedbacksKpiMonthBounds;
};
