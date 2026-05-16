import type { CampaignRecord, CampaignStatus } from "@/src/components/dashboard/marketing/types";

export type CampaignRowDb = {
  id: string;
  name: string;
  subject: string;
  content: string;
  image_url: string | null;
  created_at: string;
  sent_at: string | null;
};

export type CampaignRecipientRowDb = {
  campaign_id: string;
  opened_at: string | null;
};

function campaignStatus(sentAt: string | null): CampaignStatus {
  return sentAt ? "sent" : "draft";
}

export function mapCampaignRows(
  rows: CampaignRowDb[],
  recipients: CampaignRecipientRowDb[],
): CampaignRecord[] {
  const countsByCampaign = new Map<string, { total: number; opened: number }>();

  for (const row of recipients) {
    const current = countsByCampaign.get(row.campaign_id) ?? { total: 0, opened: 0 };
    current.total += 1;
    if (row.opened_at) {
      current.opened += 1;
    }
    countsByCampaign.set(row.campaign_id, current);
  }

  return rows.map((row) => {
    const counts = countsByCampaign.get(row.id) ?? { total: 0, opened: 0 };
    return {
      id: row.id,
      name: row.name,
      subject: row.subject,
      content: row.content,
      imageUrl: row.image_url,
      createdAt: row.created_at,
      sentAt: row.sent_at,
      status: campaignStatus(row.sent_at),
      recipientsCount: counts.total,
      openedCount: counts.opened,
    };
  });
}
