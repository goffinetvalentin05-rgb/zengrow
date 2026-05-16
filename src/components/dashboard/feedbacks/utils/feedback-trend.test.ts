import { describe, expect, it } from "vitest";
import {
  buildFeedbackTrendSeries,
  hasEnoughFeedbacksForTrend,
  MIN_FEEDBACKS_FOR_TREND_CHART,
} from "@/src/components/dashboard/feedbacks/utils/feedback-trend";

describe("hasEnoughFeedbacksForTrend", () => {
  it("exige au moins 5 feedbacks", () => {
    expect(hasEnoughFeedbacksForTrend(MIN_FEEDBACKS_FOR_TREND_CHART - 1)).toBe(false);
    expect(hasEnoughFeedbacksForTrend(MIN_FEEDBACKS_FOR_TREND_CHART)).toBe(true);
  });
});

describe("buildFeedbackTrendSeries", () => {
  const ref = new Date("2026-05-16T12:00:00.000Z");

  it("agrège par jour sur 30 jours", () => {
    const feedbacks = Array.from({ length: 7 }, (_, i) => ({
      created_at: `2026-05-${String(10 + i).padStart(2, "0")}T12:00:00.000Z`,
      rating: 4 + (i % 2),
    }));
    const { points, granularity } = buildFeedbackTrendSeries(feedbacks, 30, ref);
    expect(granularity).toBe("day");
    expect(points.length).toBe(30);
    expect(points.some((p) => p.averageRating != null)).toBe(true);
  });

  it("passe en semaine pour 90 jours", () => {
    const feedbacks = Array.from({ length: 8 }, (_, i) => ({
      created_at: `2026-03-${String(1 + i).padStart(2, "0")}T12:00:00.000Z`,
      rating: 3,
    }));
    const { granularity } = buildFeedbackTrendSeries(feedbacks, 90, ref);
    expect(granularity).toBe("week");
  });
});
