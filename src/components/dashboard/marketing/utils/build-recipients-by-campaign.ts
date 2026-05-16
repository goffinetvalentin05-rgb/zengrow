import type { CampaignRecipientDetail } from "@/src/components/dashboard/marketing/types";

export type CampaignRecipientRowDb = {
  campaign_id: string;
  email: string;
  opened_at: string | null;
  sent_at: string;
};

export function buildRecipientsByCampaignId(
  rows: readonly CampaignRecipientRowDb[],
): Record<string, CampaignRecipientDetail[]> {
  const map: Record<string, CampaignRecipientDetail[]> = {};

  for (const row of rows) {
    const list = map[row.campaign_id] ?? [];
    list.push({
      email: row.email,
      openedAt: row.opened_at,
      sentAt: row.sent_at,
    });
    map[row.campaign_id] = list;
  }

  for (const campaignId of Object.keys(map)) {
    map[campaignId]?.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
  }

  return map;
}
