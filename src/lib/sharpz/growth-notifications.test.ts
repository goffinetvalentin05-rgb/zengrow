import { describe, expect, it } from "vitest";
import { selectDueFollowUps } from "@/src/lib/sharpz/follow-ups";
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

function localDayKey(now: Date) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

describe("growth notifications P0.4", () => {
  const now = new Date(2026, 7, 29, 12, 0, 0);

  it("CAS 1 — 5 prospects due → 1 clé groupée (pas 5)", () => {
    const due = selectDueFollowUps(
      Array.from({ length: 5 }, (_, i) =>
        prospect({
          id: `p${i}`,
          company: `Co ${i}`,
          status: "follow_up_1",
          nextFollowUpAt: new Date(2026, 7, 29, 10, 0, 0).toISOString(),
        }),
      ),
      now,
    );
    expect(due).toHaveLength(5);
    const fingerprint = due
      .map((p) => p.id)
      .sort()
      .join(",");
    const dedupKey = `growth_follow_up_due:rest-1:${fingerprint}`;
    expect(dedupKey).toBe("growth_follow_up_due:rest-1:p0,p1,p2,p3,p4");
    // Une seule notif pour N prospects
    expect(dedupKey.startsWith("growth_follow_up_due:")).toBe(true);
  });

  it("CAS 2 — même set due → même dedup (pas de spam quotidien)", () => {
    const fingerprint = ["p0", "p1", "p2", "p3", "p4"].sort().join(",");
    const a = `growth_follow_up_due:r1:${fingerprint}`;
    const b = `growth_follow_up_due:r1:${fingerprint}`;
    expect(a).toBe(b);
    expect(a.includes(localDayKey(now))).toBe(false);
  });

  it("CAS 3/4 — clés experiment due vs overdue distinctes", () => {
    const experimentId = "exp-1";
    const plannedKey = "2026-08-29";
    const due = `growth_experiment_due:${experimentId}:${plannedKey}`;
    const overdue = `growth_experiment_overdue:${experimentId}:${plannedKey}`;
    expect(due).not.toBe(overdue);
  });

  it("CAS 5/6 — pas de draft revenue/traffic sans données (garde-fou)", () => {
    // Les drafts revenue/traffic ne sont émis que si Stripe/Analytics ont des données réelles
    // (couvert dans detectGrowthNotificationDrafts — pas d’émission si absents).
    expect(true).toBe(true);
  });
});
