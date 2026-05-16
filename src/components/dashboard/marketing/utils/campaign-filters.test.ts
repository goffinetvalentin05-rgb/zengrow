import { describe, expect, it } from "vitest";
import { filterCampaigns } from "@/src/components/dashboard/marketing/utils/campaign-filters";
import type { CampaignRecord } from "@/src/components/dashboard/marketing/types";

const baseCampaign = (overrides: Partial<CampaignRecord>): CampaignRecord => ({
  id: "1",
  name: "Soirée St-Valentin",
  subject: "Une soirée romantique",
  content: "Corps",
  imageUrl: null,
  createdAt: "2026-05-01T10:00:00.000Z",
  sentAt: "2026-05-10T12:00:00.000Z",
  status: "sent",
  recipientsCount: 10,
  openedCount: 5,
  ...overrides,
});

describe("filterCampaigns", () => {
  const campaigns = [
    baseCampaign({ id: "a", name: "Soirée", status: "sent", sentAt: "2026-05-10T12:00:00.000Z" }),
    baseCampaign({ id: "b", name: "Brouillon promo", status: "draft", sentAt: null }),
  ];

  it("filtre par statut envoyée", () => {
    const result = filterCampaigns(campaigns, { query: "", status: "sent" });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("a");
  });

  it("filtre par recherche sur le nom", () => {
    const result = filterCampaigns(campaigns, { query: "brouillon", status: "all" });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("b");
  });
});
