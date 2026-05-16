import type { CampaignRecord } from "@/src/components/dashboard/marketing/types";
import { subDays } from "date-fns";

export type MarketingKpisTrendTone = "success" | "warning" | "muted";

export type MarketingKpis = {
  campaignsLast30Days: number;
  emailsSentLast30Days: number;
  uniqueRecipientsLast30Days: number;
  openRatePercent: number | null;
  openRateValueTone: "success" | "warning" | "danger" | "muted";
  openRateTrend: { label: string; tone: MarketingKpisTrendTone };
  openTrackingAvailable: boolean;
  clickTrackingAvailable: boolean;
  clickCount: number;
  emailsForClickDenominator: number;
};

export type CampaignRecipientSnapshot = {
  campaignId: string;
  email: string;
  openedAt: string | null;
};

function parseTime(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : t;
}

function isInRange(t: number, start: number, end: number): boolean {
  return t >= start && t <= end;
}

export function openRatePercentTone(rate: number | null): MarketingKpis["openRateValueTone"] {
  if (rate == null) return "muted";
  if (rate >= 30) return "success";
  if (rate >= 20) return "warning";
  return "danger";
}

export function openRateMonthTrend(
  currentRate: number,
  previousRate: number,
  currentSent: number,
  previousSent: number,
): { label: string; tone: MarketingKpisTrendTone } {
  const suffix = " vs mois dernier";
  if (currentSent === 0 && previousSent === 0) {
    return { label: `→ stable${suffix}`, tone: "muted" };
  }
  if (previousSent === 0) {
    return { label: `—${suffix}`, tone: "muted" };
  }
  const delta = Math.round((currentRate - previousRate) * 10) / 10;
  if (delta === 0) {
    return { label: `→ stable${suffix}`, tone: "muted" };
  }
  const arrow = delta > 0 ? "↑" : "↓";
  const signed = delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
  return {
    label: `${arrow} ${signed} pt${suffix}`,
    tone: delta > 0 ? "success" : "warning",
  };
}

export function formatOpenRateValue(rate: number | null): string {
  if (rate == null) return "—";
  return `${rate.toLocaleString("fr-CH", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

export function formatUniqueRecipientsSubline(count: number): string {
  if (count === 0) return "Aucun destinataire sur la période";
  if (count === 1) return "À 1 destinataire unique";
  return `À ${count} destinataires uniques`;
}

export function formatClickSubline(clicks: number, emails: number): string {
  if (!emails) return "Aucun e-mail envoyé sur la période";
  if (clicks === 0) return `0 clic sur ${emails} e-mail${emails > 1 ? "s" : ""}`;
  if (clicks === 1) return `1 clic sur ${emails} e-mail${emails > 1 ? "s" : ""}`;
  return `${clicks} clics sur ${emails} e-mails`;
}

function recipientsInSentWindow(
  campaigns: readonly CampaignRecord[],
  recipients: readonly CampaignRecipientSnapshot[],
  windowStart: number,
  windowEnd: number,
): CampaignRecipientSnapshot[] {
  const campaignIds = new Set(
    campaigns
      .filter((c) => {
        const sent = parseTime(c.sentAt);
        return sent != null && isInRange(sent, windowStart, windowEnd);
      })
      .map((c) => c.id),
  );

  return recipients.filter((r) => campaignIds.has(r.campaignId));
}

function openRateFromRecipients(rows: readonly CampaignRecipientSnapshot[]): number | null {
  if (rows.length === 0) return null;
  const opened = rows.filter((r) => r.openedAt != null).length;
  return Math.round((opened / rows.length) * 1000) / 10;
}

export function computeMarketingKpis(
  campaigns: readonly CampaignRecord[],
  recipients: readonly CampaignRecipientSnapshot[],
  refDate: Date = new Date(),
): MarketingKpis {
  const windowEnd = refDate.getTime();
  const currentStart = subDays(refDate, 30).getTime();
  const previousStart = subDays(refDate, 60).getTime();

  const sentCampaignsCurrent = campaigns.filter((c) => {
    const sent = parseTime(c.sentAt);
    return sent != null && isInRange(sent, currentStart, windowEnd);
  });

  const currentRecipients = recipientsInSentWindow(campaigns, recipients, currentStart, windowEnd);
  const previousRecipients = recipientsInSentWindow(campaigns, recipients, previousStart, currentStart);

  const emailsSentLast30Days = currentRecipients.length;
  const uniqueRecipientsLast30Days = new Set(
    currentRecipients.map((r) => r.email.trim().toLowerCase()).filter(Boolean),
  ).size;

  const openRatePercent = openRateFromRecipients(currentRecipients);
  const previousOpenRate = openRateFromRecipients(previousRecipients) ?? 0;
  const currentOpenForTrend = openRatePercent ?? 0;

  const openTrackingAvailable = emailsSentLast30Days > 0;

  return {
    campaignsLast30Days: sentCampaignsCurrent.length,
    emailsSentLast30Days,
    uniqueRecipientsLast30Days,
    openRatePercent,
    openRateValueTone: openTrackingAvailable ? openRatePercentTone(openRatePercent) : "muted",
    openRateTrend: openRateMonthTrend(
      currentOpenForTrend,
      previousOpenRate,
      currentRecipients.length,
      previousRecipients.length,
    ),
    openTrackingAvailable,
    clickTrackingAvailable: false,
    clickCount: 0,
    emailsForClickDenominator: emailsSentLast30Days,
  };
}
