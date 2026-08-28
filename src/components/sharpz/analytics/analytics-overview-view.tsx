"use client";

import Link from "next/link";
import { BarChart3, DollarSign, FileSearch } from "lucide-react";
import StatCard from "@/src/components/ui/stat-card";
import Button from "@/src/components/ui/button";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { analyticsHref } from "@/src/lib/sharpz/routes";
import type { TrafficSummary } from "@/src/lib/sharpz/analytics";

type Props = {
  traffic: TrafficSummary;
  auditScore: number | null;
  hasVerifiedAudit: boolean;
  stripeConnected: boolean;
};

export function AnalyticsOverviewView({ traffic, auditScore, hasVerifiedAudit, stripeConnected }: Props) {
  const { t } = useDashboardI18n();

  return (
    <section className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t.analyticsPage.visitors7d}
          value={traffic.hasData ? traffic.visitors7d : "—"}
          icon={BarChart3}
        />
        <StatCard
          label={t.analyticsPage.pageviews7d}
          value={traffic.hasData ? traffic.pageviews7d : "—"}
          icon={BarChart3}
        />
        <StatCard
          label={t.analyticsPage.auditScoreLabel}
          value={auditScore != null ? `${auditScore}/100` : "—"}
          icon={FileSearch}
        />
        <StatCard
          label={t.analyticsPage.mrrLabel}
          value={stripeConnected ? t.analyticsPage.revenueConnected : "—"}
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {!traffic.hasData ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h3 className="text-base font-semibold text-zg-fg">{t.analyticsPage.trafficNotConnected}</h3>
            <p className="mt-2 text-sm text-zg-text-secondary">{t.analyticsPage.overviewTrafficMissing}</p>
            <Link href={analyticsHref("traffic")} className="mt-4 inline-block">
              <Button type="button" size="sm" variant="secondary">
                {t.analyticsPage.tabTraffic}
              </Button>
            </Link>
          </div>
        ) : null}

        {!hasVerifiedAudit ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h3 className="text-base font-semibold text-zg-fg">{t.analyticsPage.saasMissingTitle}</h3>
            <p className="mt-2 text-sm text-zg-text-secondary">{t.analyticsPage.saasMissingDescription}</p>
            <Link href={analyticsHref("saas")} className="mt-4 inline-block">
              <Button type="button" size="sm" variant="secondary">
                {t.analyticsPage.tabSaas}
              </Button>
            </Link>
          </div>
        ) : null}

        {!stripeConnected ? (
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
            <h3 className="text-base font-semibold text-zg-fg">{t.analyticsPage.revenueEmptyTitle}</h3>
            <p className="mt-2 text-sm text-zg-text-secondary">{t.analyticsPage.revenueEmptyDescription}</p>
            <Link href={`${analyticsHref("revenue")}`} className="mt-4 inline-block">
              <Button type="button" size="sm" variant="secondary">
                {t.analyticsPage.tabRevenue}
              </Button>
            </Link>
          </div>
        ) : null}
      </div>

      <p className="text-xs text-zg-muted">{t.analyticsPage.overviewHonesty}</p>
    </section>
  );
}
