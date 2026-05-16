import { formatInTimeZone } from "date-fns-tz";
import { fr } from "date-fns/locale";
import { businessCalendarTimeZone } from "@/src/lib/date/business-calendar";

export function formatCampaignDisplayDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return formatInTimeZone(date, businessCalendarTimeZone(), "d MMMM yyyy", { locale: fr });
}

export function formatCampaignOpenRatePercent(openedCount: number, recipientsCount: number): string {
  if (recipientsCount <= 0) return "—";
  const rate = Math.round((openedCount / recipientsCount) * 1000) / 10;
  return `${rate.toLocaleString("fr-CH", { minimumFractionDigits: 0, maximumFractionDigits: 1 })} %`;
}

export function formatCampaignClickRatePercent(): string {
  return "— %";
}

export function buildCampaignStatsLine(campaign: {
  sentAt: string | null;
  createdAt: string;
  recipientsCount: number;
  openedCount: number;
}): string {
  const dateIso = campaign.sentAt ?? campaign.createdAt;
  const dateLabel = formatCampaignDisplayDate(dateIso);
  const sentLabel =
    campaign.recipientsCount === 0
      ? "0 envoyé"
      : campaign.recipientsCount === 1
        ? "1 envoyé"
        : `${campaign.recipientsCount} envoyés`;

  if (!campaign.sentAt) {
    return `Brouillon · ${dateLabel}`;
  }

  const openLabel = formatCampaignOpenRatePercent(campaign.openedCount, campaign.recipientsCount);
  const clickLabel = formatCampaignClickRatePercent();
  return `${sentLabel} · ${openLabel} ouverts · ${clickLabel} cliqués · ${dateLabel}`;
}
