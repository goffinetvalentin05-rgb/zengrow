import type { CampaignStatus } from "@/src/components/dashboard/marketing/types";

export type CampaignStatusBadgeTone = "neutral" | "success" | "info";

export type CampaignStatusBadge = {
  label: string;
  tone: CampaignStatusBadgeTone;
};

export function campaignStatusBadge(status: CampaignStatus): CampaignStatusBadge {
  if (status === "sent") {
    return { label: "ENVOYÉE", tone: "success" };
  }
  return { label: "BROUILLON", tone: "neutral" };
}
