import { describe, expect, it } from "vitest";
import {
  computeFeedbackKpis,
  ratingAverageMonthTrend,
} from "@/src/components/dashboard/feedbacks/utils/feedback-kpis";
import type { FeedbackRecord } from "@/src/components/dashboard/feedbacks/types";

const baseFeedback = (overrides: Partial<FeedbackRecord>): FeedbackRecord => ({
  id: "1",
  created_at: "2026-05-10T12:00:00.000Z",
  customer_name: "Test",
  customer_email: "test@example.com",
  rating: 5,
  message: "Super",
  read_at: null,
  internal_note: null,
  rating_criteria: null,
  reservation_id: "res-1",
  reservation_date: "2026-05-10",
  customer_id: null,
  guests: 2,
  ai_analysis: null,
  ...overrides,
});

describe("ratingAverageMonthTrend", () => {
  it("indique une hausse de note moyenne", () => {
    expect(ratingAverageMonthTrend(4.5, 4.2, 3, 2)).toEqual({
      label: "+0.3 vs mois dernier",
      tone: "success",
    });
  });

  it("indique une baisse de note moyenne", () => {
    expect(ratingAverageMonthTrend(3.8, 4.5, 2, 2)).toEqual({
      label: "-0.7 vs mois dernier",
      tone: "warning",
    });
  });
});

describe("computeFeedbackKpis", () => {
  it("calcule moyenne, taux de réponse et à traiter", () => {
    const feedbacks = [
      baseFeedback({ id: "a", rating: 5, read_at: null }),
      baseFeedback({ id: "b", rating: 2, read_at: null }),
      baseFeedback({ id: "c", rating: 4, read_at: null, created_at: "2026-04-20T12:00:00.000Z" }),
    ];
    const kpis = computeFeedbackKpis(
      feedbacks,
      4,
      "2026-05-01T00:00:00.000Z",
      "2026-05-31T23:59:59.999Z",
      "2026-04-01T00:00:00.000Z",
      "2026-04-30T23:59:59.999Z",
    );
    expect(kpis.averageRating).toBe(3.7); // (5 + 2 + 4) / 3
    expect(kpis.totalFeedbacks).toBe(3);
    expect(kpis.feedbacksThisMonth).toBe(2);
    expect(kpis.responseRatePercent).toBe(50);
    expect(kpis.pendingCount).toBe(3);
    expect(kpis.lowRatingPendingCount).toBe(1);
  });
});
