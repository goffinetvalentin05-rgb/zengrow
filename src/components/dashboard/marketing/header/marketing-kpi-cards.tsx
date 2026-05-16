"use client";

import MarketingTrackingKpiCard from "@/src/components/dashboard/marketing/header/marketing-tracking-kpi-card";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import {
  formatClickSubline,
  formatOpenRateValue,
  formatUniqueRecipientsSubline,
} from "@/src/components/dashboard/marketing/utils/marketing-kpis";
import ReservationsKpiCard from "@/src/components/dashboard/reservations/header/reservations-kpi-card";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { cn } from "@/src/lib/utils";
import { Eye, Mail, MousePointerClick, Send } from "lucide-react";

const openRateValueClass: Record<"success" | "warning" | "danger" | "muted", string> = {
  success: "text-zg-success",
  warning: "text-zg-warning",
  danger: "text-zg-danger",
  muted: "text-zg-fg",
};

export default function MarketingKpiCards() {
  const { kpis } = useMarketing();
  const showToast = useDashboardToast();

  function onTrackingActivate() {
    showToast({
      message:
        "Le suivi des clics arrive bientôt. Les ouvertures sont déjà mesurées via notre pixel de suivi.",
    });
  }

  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4 xl:gap-6"
      aria-labelledby="marketing-kpi-heading"
    >
      <h2 id="marketing-kpi-heading" className="sr-only">
        Indicateurs marketing
      </h2>

      <ReservationsKpiCard
        label="Campagnes ce mois"
        value={kpis.campaignsLast30Days}
        subline="Sur les 30 derniers jours"
        icon={Mail}
        dataTone="accent"
      />

      <ReservationsKpiCard
        label="Total e-mails envoyés"
        value={kpis.emailsSentLast30Days}
        subline={formatUniqueRecipientsSubline(kpis.uniqueRecipientsLast30Days)}
        icon={Send}
        dataTone="info"
      />

      {kpis.openTrackingAvailable ? (
        <ReservationsKpiCard
          label="Taux d'ouverture moyen"
          value={formatOpenRateValue(kpis.openRatePercent)}
          trend={kpis.openRateTrend.label}
          trendTone={kpis.openRateTrend.tone}
          icon={Eye}
          dataTone="premium"
          valueClassName={cn(openRateValueClass[kpis.openRateValueTone])}
        />
      ) : (
        <MarketingTrackingKpiCard
          label="Taux d'ouverture moyen"
          icon={Eye}
          dataTone="premium"
          onActivate={onTrackingActivate}
        />
      )}

      {kpis.clickTrackingAvailable ? (
        <ReservationsKpiCard
          label="Taux de clic moyen"
          value="0.0 %"
          subline={formatClickSubline(kpis.clickCount, kpis.emailsForClickDenominator)}
          icon={MousePointerClick}
          dataTone="success"
        />
      ) : (
        <MarketingTrackingKpiCard
          label="Taux de clic moyen"
          icon={MousePointerClick}
          dataTone="success"
          onActivate={onTrackingActivate}
        />
      )}
    </div>
  );
}
