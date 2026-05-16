import { describe, expect, it } from "vitest";
import {
  countActiveFeedbackFilters,
  DEFAULT_FEEDBACK_FILTERS,
  filterFeedbacks,
} from "@/src/components/dashboard/feedbacks/utils/feedback-filters";
import type { FeedbackRecord } from "@/src/components/dashboard/feedbacks/types";

const row = (overrides: Partial<FeedbackRecord>): FeedbackRecord => ({
  id: "1",
  created_at: "2026-05-15T10:00:00.000Z",
  customer_name: "Alice",
  customer_email: "alice@example.com",
  rating: 5,
  message: "Excellent service",
  read_at: null,
  ...overrides,
});

describe("filterFeedbacks", () => {
  const rows = [
    row({ id: "a", customer_name: "Alice", rating: 5, read_at: null }),
    row({ id: "b", customer_name: "Bob", rating: 2, message: "Déçu", read_at: "2026-05-16T10:00:00.000Z" }),
    row({ id: "c", customer_name: "Claire", rating: 4, message: null, read_at: null }),
  ];

  it("filtre par recherche nom ou contenu", () => {
    const filtered = filterFeedbacks(rows, {
      ...DEFAULT_FEEDBACK_FILTERS,
      query: "déçu",
    });
    expect(filtered.map((r) => r.id)).toEqual(["b"]);
  });

  it("filtre les non lus et notes", () => {
    const filtered = filterFeedbacks(rows, {
      ...DEFAULT_FEEDBACK_FILTERS,
      readStatus: "unread",
      ratingMin: 4,
      ratingMax: 5,
    });
    expect(filtered.map((r) => r.id)).toEqual(["a", "c"]);
  });

  it("filtre avec ou sans commentaire", () => {
    const filtered = filterFeedbacks(rows, {
      ...DEFAULT_FEEDBACK_FILTERS,
      commentFilter: "without",
    });
    expect(filtered.map((r) => r.id)).toEqual(["c"]);
  });
});

describe("countActiveFeedbackFilters", () => {
  it("compte les filtres non par défaut", () => {
    expect(
      countActiveFeedbackFilters({
        ...DEFAULT_FEEDBACK_FILTERS,
        query: "test",
        readStatus: "unread",
        ratingMin: 2,
        ratingMax: 4,
      }),
    ).toBe(3);
  });
});
