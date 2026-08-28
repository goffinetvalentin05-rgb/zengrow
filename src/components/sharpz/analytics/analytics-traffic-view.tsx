"use client";

import Link from "next/link";
import { BarChart3, Copy } from "lucide-react";
import { useState } from "react";
import StatCard from "@/src/components/ui/stat-card";
import { Card } from "@/src/components/ui/card";
import Button from "@/src/components/ui/button";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";
import type { TrafficSummary } from "@/src/lib/sharpz/analytics";

type Props = {
  traffic: TrafficSummary;
  snippet: string;
};

export function AnalyticsTrafficView({ traffic, snippet }: Props) {
  const { t } = useDashboardI18n();
  const [copied, setCopied] = useState(false);

  if (!traffic.hasData) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 text-center">
          <BarChart3 className="mx-auto h-8 w-8 text-zg-text-secondary" strokeWidth={1.5} />
          <h2 className="mt-4 text-xl font-semibold text-zg-fg">{t.analyticsPage.trafficNotConnected}</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zg-text-secondary">
            {t.analyticsPage.trafficInstallHint}
          </p>
          <pre className="mx-auto mt-6 max-w-xl overflow-x-auto rounded-xl border border-white/[0.08] bg-black/40 p-4 text-left text-xs text-zg-text-secondary">
            {snippet}
          </pre>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                void navigator.clipboard.writeText(snippet);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              }}
            >
              <Copy className="h-4 w-4" />
              {copied ? t.analyticsPage.snippetCopied : t.analyticsPage.copySnippet}
            </Button>
            <Link href={`${SHARPZ_ROUTES.settings}?section=integrations`}>
              <Button type="button" size="sm" variant="ghost">
                {t.analyticsPage.openSettings}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t.analyticsPage.visitorsToday} value={traffic.visitorsToday} icon={BarChart3} />
        <StatCard label={t.analyticsPage.visitors7d} value={traffic.visitors7d} icon={BarChart3} />
        <StatCard label={t.analyticsPage.sessions7d} value={traffic.sessions7d} icon={BarChart3} />
        <StatCard label={t.analyticsPage.pageviews7d} value={traffic.pageviews7d} icon={BarChart3} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankList title={t.analyticsPage.topPages} rows={traffic.topPages} />
        <RankList title={t.analyticsPage.topReferrers} rows={traffic.topReferrers} />
        <RankList title={t.analyticsPage.topSources} rows={traffic.topSources} />
        <RankList title={t.analyticsPage.devices} rows={traffic.devices} />
        <RankList title={t.analyticsPage.countries} rows={traffic.countries} className="lg:col-span-2" />
      </div>

      {traffic.lastEventAt ? (
        <p className="text-xs text-zg-muted">
          {t.analyticsPage.lastEvent}: {new Date(traffic.lastEventAt).toLocaleString()}
        </p>
      ) : null}
    </section>
  );
}

function RankList({
  title,
  rows,
  className,
}: {
  title: string;
  rows: { label: string; count: number }[];
  className?: string;
}) {
  return (
    <Card className={`space-y-3 p-5 ${className ?? ""}`}>
      <h3 className="text-sm font-semibold text-zg-fg">{title}</h3>
      {rows.length ? (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-zg-text-secondary">{row.label}</span>
              <span className="shrink-0 tabular-nums text-zg-fg">{row.count}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zg-muted">—</p>
      )}
    </Card>
  );
}
