import { describe, expect, it } from "vitest";
import {
  computeMarketingKpis,
  openRateMonthTrend,
  openRatePercentTone,
} from "@/src/components/dashboard/marketing/utils/marketing-kpis";
import type { CampaignRecord } from "@/src/components/dashboard/marketing/types";

const baseCampaign = (overrides: Partial<CampaignRecord>): CampaignRecord => ({
  id: "c1",
  name: "Test",
  subject: "Objet",
  content: "Corps",
  imageUrl: null,
  createdAt: "2026-05-01T10:00:00.000Z",
  sentAt: "2026-05-10T12:00:00.000Z",
  status: "sent",
  recipientsCount: 2,
  openedCount: 1,
  ...overrides,
});

describe("openRatePercentTone", () => {
  it("applique les seuils vert / orange / rouge", () => {
    expect(openRatePercentTone(35)).toBe("success");
    expect(openRatePercentTone(25)).toBe("warning");
    expect(openRatePercentTone(12)).toBe("danger");
  });
});

describe("openRateMonthTrend", () => {
  it("indique une hausse du taux d'ouverture", () => {
    expect(openRateMonthTrend(40, 30, 10, 10)).toEqual({
      label: "↑ +10.0 pt vs mois dernier",
      tone: "success",
    });
  });
});

describe("computeMarketingKpis", () => {
  const refDate = new Date("2026-05-16T12:00:00.000Z");

  it("agrège campagnes et ouvertures sur 30 jours", () => {
    const campaigns = [
      baseCampaign({ id: "a", sentAt: "2026-05-10T12:00:00.000Z" }),
      baseCampaign({ id: "b", sentAt: "2026-04-01T12:00:00.000Z" }),
    ];
    const recipients = [
      { campaignId: "a", email: "a@test.com", openedAt: "2026-05-11T08:00:00.000Z" },
      { campaignId: "a", email: "b@test.com", openedAt: null },
      { campaignId: "b", email: "old@test.com", openedAt: "2026-04-02T08:00:00.000Z" },
    ];

    const kpis = computeMarketingKpis(campaigns, recipients, refDate);

    expect(kpis.campaignsLast30Days).toBe(1);
    expect(kpis.emailsSentLast30Days).toBe(2);
    expect(kpis.uniqueRecipientsLast30Days).toBe(2);
    expect(kpis.openRatePercent).toBe(50);
    expect(kpis.openTrackingAvailable).toBe(true);
    expect(kpis.clickTrackingAvailable).toBe(false);
  });
});
