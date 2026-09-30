import { describe, expect, it } from "vitest";
import { entitlementsFor } from "@/src/lib/billing/entitlements";
import { calendarDateInTimezone, formatMinutes, shiftIsoDate, sumMinutesInWeek, weekStartIso, weekdayFromIso } from "@/src/lib/learn/calendar";
import { createItem } from "@/src/lib/learn/db";
import { mistakeScore, rankRecurringMistakes } from "@/src/lib/learn/mistakes";
import { takeRateLimit } from "@/src/lib/learn/rate-limit";
import { destinationAfterAuth } from "@/src/lib/learn/routing";
import { applyReview, initialSrsState } from "@/src/lib/learn/srs";
import { nextStreak } from "@/src/lib/learn/streak";
import { generateApiToken, hashToken, readBearer } from "@/src/lib/learn/tokens";
import { executeLearnAction } from "@/src/lib/learn/tools/execute";
import { parseActionInput, stripClientIdentity } from "@/src/lib/learn/tools/schemas";

const now = new Date("2026-09-30T12:00:00.000Z");

describe("spaced repetition", () => {
  it("schedules a new card immediately", () => {
    const state = initialSrsState(now);
    expect(state.status).toBe("new");
    expect(state.dueAt).toBe(now.toISOString());
    expect(state.ease).toBe(2.5);
  });

  it("resets on again and keeps a short delay", () => {
    const next = applyReview(initialSrsState(now), "again", now);
    expect(next.state.lapses).toBe(1);
    expect(next.state.repetitions).toBe(0);
    expect(next.state.intervalDays).toBe(0);
    expect(next.state.status).toBe("learning");
    expect(new Date(next.state.dueAt).getTime() - now.getTime()).toBe(10 * 60 * 1000);
  });

  it("grows normally on good and faster on easy", () => {
    const first = applyReview(initialSrsState(now), "good", now);
    expect(first.state.intervalDays).toBe(1);
    expect(first.state.status).toBe("learning");
    const second = applyReview(first.state, "good", now);
    expect(second.state.intervalDays).toBe(3);
    const easy = applyReview(initialSrsState(now), "easy", now);
    expect(easy.state.intervalDays).toBe(4);
    expect(easy.state.ease).toBeGreaterThan(2.5);
  });

  it("keeps mastered cards scheduled", () => {
    let state = initialSrsState(now);
    state = { ...state, repetitions: 4, intervalDays: 21, status: "mastered" };
    const next = applyReview(state, "good", now);
    expect(next.state.status).toBe("mastered");
    expect(next.state.intervalDays).toBeGreaterThanOrEqual(21);
    const again = applyReview(next.state, "again", now);
    expect(again.state.status).toBe("learning");
  });
});

describe("streak and week", () => {
  it("counts a day once and continues from yesterday", () => {
    const first = nextStreak({ currentStreak: 0, longestStreak: 0, lastStudyOn: null }, "2026-09-30");
    expect(first.currentStreak).toBe(1);
    const same = nextStreak(first, "2026-09-30");
    expect(same.currentStreak).toBe(1);
    const next = nextStreak(same, "2026-10-01");
    expect(next.currentStreak).toBe(2);
    expect(next.longestStreak).toBe(2);
    const gap = nextStreak(next, "2026-10-05");
    expect(gap.currentStreak).toBe(1);
    expect(gap.longestStreak).toBe(2);
  });

  it("starts weeks on Monday and sums only that week", () => {
    expect(weekStartIso("2026-09-30")).toBe("2026-09-28");
    expect(weekdayFromIso("2026-09-28")).toBe(1);
    expect(weekdayFromIso("2026-10-04")).toBe(7);
    expect(shiftIsoDate("2026-09-30", 1)).toBe("2026-10-01");
    expect(formatMinutes(130)).toBe("2h 10m");
    expect(
      sumMinutesInWeek(
        [
          { startedOn: "2026-09-28", minutes: 20 },
          { startedOn: "2026-10-04", minutes: 30 },
          { startedOn: "2026-10-05", minutes: 99 },
        ],
        "2026-09-28",
      ),
    ).toBe(50);
  });

  it("uses the learner timezone for the calendar day", () => {
    const eveningUtc = new Date("2026-09-30T23:30:00.000Z");
    expect(calendarDateInTimezone(eveningUtc, "Pacific/Auckland")).toBe("2026-10-01");
    expect(calendarDateInTimezone(eveningUtc, "America/Los_Angeles")).toBe("2026-09-30");
  });
});

describe("tokens and rate limit", () => {
  it("hashes without keeping the raw token and reads only lg_ bearers", () => {
    const token = generateApiToken();
    expect(token.raw.startsWith("lg_")).toBe(true);
    expect(token.prefix).toBe(token.raw.slice(0, 10));
    expect(token.tokenHash).toBe(hashToken(token.raw));
    expect(token.tokenHash).not.toContain(token.raw);
    expect(readBearer(`Bearer ${token.raw}`)).toBe(token.raw);
    expect(readBearer("Bearer sk_live_secret")).toBeNull();
    expect(readBearer(null)).toBeNull();
  });

  it("limits a key inside the window", () => {
    const key = `test-${Math.random()}`;
    expect(takeRateLimit(key, 2, 1000, 1_000).ok).toBe(true);
    expect(takeRateLimit(key, 2, 1000, 1_100).ok).toBe(true);
    expect(takeRateLimit(key, 2, 1000, 1_200).ok).toBe(false);
    expect(takeRateLimit(key, 2, 1000, 2_200).ok).toBe(true);
  });
});

describe("recurring mistakes and routing", () => {
  it("ranks corrections by lapses and hard ratings", () => {
    expect(mistakeScore({ lapses: 2, againCount: 1, hardCount: 1 })).toBe(9);
    const ranked = rankRecurringMistakes([
      { id: "a", title: "A", incorrectForm: "a", correctForm: "A", lapses: 0, againCount: 0, hardCount: 0 },
      { id: "b", title: "B", incorrectForm: "b", correctForm: "B", lapses: 1, againCount: 0, hardCount: 0 },
      { id: "c", title: "C", incorrectForm: "c", correctForm: "C", lapses: 0, againCount: 3, hardCount: 0 },
    ]);
    expect(ranked.map((item) => item.id)).toEqual(["c", "b"]);
  });

  it("sends a finished learner to today", () => {
    expect(destinationAfterAuth(true)).toBe("/today");
    expect(destinationAfterAuth(false)).toBe("/onboarding");
    expect(destinationAfterAuth(null)).toBe("/onboarding");
  });
});

describe("tool schemas and item identity", () => {
  it("drops a client-supplied user id before validation", () => {
    const clean = stripClientIdentity({ title: "hello", userId: "other", user_id: "other" });
    expect(clean).toEqual({ title: "hello" });
    const parsed = parseActionInput("addVocabulary", { title: "hello", userId: "attacker" });
    expect(parsed.success).toBe(true);
    if (parsed.success && "title" in parsed.data) {
      expect(parsed.data).not.toHaveProperty("userId");
      expect(parsed.data.title).toBe("hello");
    } else {
      throw new Error("expected a vocabulary payload");
    }
  });

  it("rejects an unknown action before touching data", async () => {
    const result = await executeLearnAction({ supabase: {} as never, userId: "user-a" }, "dropTable", { userId: "user-b" });
    expect(result.ok).toBe(false);
  });

  it("reuses an existing external_ref for the token user only", async () => {
    const filters: string[] = [];
    let inserted = false;
    const existing = {
      id: "item-1",
      user_id: "user-a",
      kind: "vocabulary",
      title: "already",
      body: null,
      translation: "déjà",
      example: null,
      incorrect_form: null,
      correct_form: null,
      category_id: null,
      source_kind: "chatgpt",
      source_label: null,
      status: "learning",
      origin: "chatgpt",
      external_ref: "chat-1",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      learning_categories: null,
      review_states: { due_at: now.toISOString(), interval_days: 1, lapses: 0 },
    };
    const supabase = {
      from() {
        const chain = {
          select() {
            return chain;
          },
          eq(column: string, value: string) {
            filters.push(`${column}=${value}`);
            return chain;
          },
          maybeSingle: async () => ({ data: existing, error: null }),
          insert() {
            inserted = true;
            return chain;
          },
        };
        return chain;
      },
    };

    const result = await createItem(
      { supabase: supabase as never, userId: "user-a" },
      { kind: "vocabulary", title: "hello", externalRef: "chat-1", origin: "chatgpt" },
    );
    expect(result.created).toBe(false);
    expect(result.item.id).toBe("item-1");
    expect(result.item.userId).toBe("user-a");
    expect(inserted).toBe(false);
    expect(filters).toContain("user_id=user-a");
    expect(filters).not.toContain("user_id=user-b");
  });
});

describe("entitlements", () => {
  it("keeps the API open for both plans during the first tests", () => {
    expect(entitlementsFor(false).apiEnabled).toBe(true);
    expect(entitlementsFor(true).apiEnabled).toBe(true);
    expect(entitlementsFor(true).plan).toBe("pro");
  });
});
