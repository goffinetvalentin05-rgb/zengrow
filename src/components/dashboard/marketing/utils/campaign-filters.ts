import type { CampaignRecord, CampaignStatus } from "@/src/components/dashboard/marketing/types";

export type CampaignStatusFilter = "all" | CampaignStatus | "scheduled";

export type CampaignFilters = {
  query: string;
  status: CampaignStatusFilter;
};

export const DEFAULT_CAMPAIGN_FILTERS: CampaignFilters = {
  query: "",
  status: "all",
};

function matchesQuery(campaign: CampaignRecord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    campaign.name.toLowerCase().includes(q) ||
    campaign.subject.toLowerCase().includes(q)
  );
}

function matchesStatus(campaign: CampaignRecord, status: CampaignStatusFilter): boolean {
  if (status === "all") return true;
  if (status === "scheduled") return false;
  return campaign.status === status;
}

export function filterCampaigns(
  campaigns: readonly CampaignRecord[],
  filters: CampaignFilters,
): CampaignRecord[] {
  return campaigns.filter(
    (campaign) => matchesQuery(campaign, filters.query) && matchesStatus(campaign, filters.status),
  );
}

export function countCampaignsByStatus(
  campaigns: readonly CampaignRecord[],
  status: CampaignStatusFilter,
): number {
  if (status === "all") return campaigns.length;
  if (status === "scheduled") return 0;
  return campaigns.filter((c) => c.status === status).length;
}
