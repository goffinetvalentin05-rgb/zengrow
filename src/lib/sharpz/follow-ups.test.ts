import { describe, expect, it } from "vitest";
import {
  buildFollowUpGrowthSignal,
  daysSinceLastContact,
  isEligibleForFollowUpReminder,
  isFollowUpDue,
  nextStatusAfterFollowUp,
  selectDueFollowUps,
} from "@/src/lib/sharpz/follow-ups";
import type { Prospect } from "@/src/lib/sharpz/types";

function prospect(partial: Partial<Prospect> & Pick<Prospect, "id" | "company" | "status">): Prospect {
  return {
    type: "company",
    name: null,
    email: null,
    phone: null,
    url: null,
    contact: null,
    source: null,
    sourceUrl: null,
    whyFit: null,
    fitScore: null,
    lastAction: null,
    contactedAt: null,
    nextFollowUpAt: null,
    notes: null,
    linkedinUrl: null,
    instagramUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...partial,
  };
}

describe("follow-ups P0.2", () => {
  const now = new Date(2026, 7, 28, 15, 0, 0); // 28 août 2026 local

  function atLocalDay(year: number, monthIndex: number, day: number) {
    return new Date(year, monthIndex, day, 12, 0, 0, 0).toISOString();
  }

  it("isFollowUpDue is true for today and overdue, false for future", () => {
    expect(isFollowUpDue(atLocalDay(2026, 7, 28), now)).toBe(true);
    expect(isFollowUpDue(atLocalDay(2026, 7, 20), now)).toBe(true);
    expect(isFollowUpDue(atLocalDay(2026, 8, 1), now)).toBe(false);
    expect(isFollowUpDue(null, now)).toBe(false);
  });

  it("excludes customer and closed", () => {
    expect(isEligibleForFollowUpReminder("follow_up_1")).toBe(true);
    expect(isEligibleForFollowUpReminder("customer")).toBe(false);
    expect(isEligibleForFollowUpReminder("closed")).toBe(false);
  });

  it("selectDueFollowUps ignores status-only without due date", () => {
    const due = selectDueFollowUps(
      [
        prospect({ id: "1", company: "A", status: "to_contact", nextFollowUpAt: null }),
        prospect({
          id: "2",
          company: "B",
          status: "follow_up_1",
          nextFollowUpAt: atLocalDay(2026, 7, 27),
        }),
        prospect({
          id: "3",
          company: "C",
          status: "customer",
          nextFollowUpAt: atLocalDay(2026, 7, 20),
        }),
        prospect({
          id: "4",
          company: "D",
          status: "qualified",
          nextFollowUpAt: atLocalDay(2026, 8, 10),
        }),
      ],
      now,
    );
    expect(due.map((item) => item.id)).toEqual(["2"]);
  });

  it("builds a single grouped growth signal", () => {
    const signal = buildFollowUpGrowthSignal([
      prospect({ id: "1", company: "A", status: "follow_up_1", nextFollowUpAt: atLocalDay(2026, 7, 28) }),
      prospect({ id: "2", company: "B", status: "follow_up_2", nextFollowUpAt: atLocalDay(2026, 7, 27) }),
    ]);
    expect(signal?.count).toBe(2);
    expect(signal?.title).toContain("2");
    expect(signal?.kind).toBe("prospect_follow_up_due");
  });

  it("advances pipeline after follow-up", () => {
    expect(nextStatusAfterFollowUp("to_contact")).toBe("follow_up_1");
    expect(nextStatusAfterFollowUp("follow_up_1")).toBe("follow_up_2");
    expect(nextStatusAfterFollowUp("qualified")).toBe("qualified");
  });

  it("daysSinceLastContact uses local day distance", () => {
    expect(
      daysSinceLastContact(
        { contactedAt: atLocalDay(2026, 7, 25), updatedAt: "" },
        now,
      ),
    ).toBe(3);
    expect(daysSinceLastContact({ contactedAt: null, updatedAt: "" }, now)).toBeNull();
  });
});
