"use client";

import Link from "next/link";
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
  const gaps = [
    !traffic.hasData
      ? { href: analyticsHref("traffic"), title: t.analyticsPage.trafficNotConnected, detail: t.analyticsPage.overviewTrafficMissing, cta: t.analyticsPage.tabTraffic }
      : null,
    !hasVerifiedAudit
      ? { href: analyticsHref("saas"), title: t.analyticsPage.saasMissingTitle, detail: t.analyticsPage.saasMissingDescription, cta: t.analyticsPage.tabSaas }
      : null,
    !stripeConnected
      ? { href: analyticsHref("revenue"), title: t.analyticsPage.revenueEmptyTitle, detail: t.analyticsPage.revenueEmptyDescription, cta: t.analyticsPage.tabRevenue }
      : null,
  ].filter(Boolean) as { href: string; title: string; detail: string; cta: string }[];

  return (
    <section className="space-y-5">
      <div className="zg-surface-panel relative overflow-hidden p-7">
        <div
          className="pointer-events-none absolute -right-16 top-[-40%] h-64 w-64 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(155,122,173,0.2), transparent 68%)" }}
          aria-hidden
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zg-muted">
          {t.analyticsPage.tabOverview}
        </p>
        <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <p className="text-sm text-zg-text-secondary">{t.analyticsPage.visitors7d}</p>
            <p className="zg-stat-value mt-2 text-6xl leading-none tracking-tight text-zg-fg tabular-nums">
              {traffic.hasData ? traffic.visitors7d : "—"}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-6 lg:border-t-0 lg:pt-0">
            <MiniStat label={t.analyticsPage.pageviews7d} value={traffic.hasData ? traffic.pageviews7d : "—"} />
            <MiniStat label={t.analyticsPage.auditScoreLabel} value={auditScore != null ? `${auditScore}` : "—"} />
            <MiniStat
              label={t.analyticsPage.mrrLabel}
              value={stripeConnected ? t.analyticsPage.revenueConnected : "—"}
            />
          </div>
        </div>
        <p className="mt-8 text-xs text-zg-muted">{t.analyticsPage.overviewHonesty}</p>
      </div>

      {gaps.length ? (
        <div className="zg-surface-panel divide-y divide-white/[0.06] overflow-hidden">
          {gaps.map((gap) => (
            <Link key={gap.href} href={gap.href} className="block px-7 py-5 transition-colors hover:bg-white/[0.03]">
              <p className="text-sm font-medium text-zg-fg">{gap.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-zg-text-secondary">{gap.detail}</p>
              <p className="mt-2 text-xs text-[#cbb4dc]">{gap.cta} →</p>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-zg-muted">{label}</p>
      <p className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-zg-fg">{value}</p>
    </div>
  );
}
