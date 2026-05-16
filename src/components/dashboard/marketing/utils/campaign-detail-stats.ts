import type { CampaignRecipientDetail } from "@/src/components/dashboard/marketing/types";

export type CampaignDetailStats = {
  sent: number;
  delivered: number;
  bounces: number | null;
  spam: number | null;
  openRatePercent: number | null;
  clickRatePercent: number | null;
  clickCount: number;
  unsubscribes: number | null;
  trackingDeliverability: boolean;
  trackingClicks: boolean;
};

export function computeCampaignDetailStats(
  recipients: readonly CampaignRecipientDetail[],
): CampaignDetailStats {
  const sent = recipients.length;
  const opened = recipients.filter((r) => r.openedAt != null).length;
  const openRatePercent = sent > 0 ? Math.round((opened / sent) * 1000) / 10 : null;

  return {
    sent,
    delivered: sent,
    bounces: null,
    spam: null,
    openRatePercent,
    clickRatePercent: null,
    clickCount: 0,
    unsubscribes: null,
    trackingDeliverability: sent > 0,
    trackingClicks: false,
  };
}
