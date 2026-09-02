"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Button from "@/src/components/ui/button";
import { AnalyticsViewsChart } from "@/src/components/discovery/analytics-chart";
import {
  clickThroughRate,
  discoveryConversion,
  followConversion,
  formatDelta,
  percentChange,
  platformLabel,
  topLinkLabel,
  trafficSourceLabel,
} from "@/src/lib/discovery/analytics";
import { ANALYTICS_RANGES, type AnalyticsRange } from "@/src/lib/discovery/constants";
import { SHARPZ_PRO_PRICE_LABEL } from "@/src/lib/discovery/pro";
import type { ProfileAnalytics } from "@/src/lib/discovery/types";
import { useI18n } from "@/src/i18n/provider";
import { interpolate } from "@/src/locales/app";
import { cn } from "@/src/lib/utils";

export function AnalyticsView({
  analytics,
  range,
  tier,
}: {
  analytics: ProfileAnalytics;
  range: AnalyticsRange;
  tier: "full" | "limited";
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [pending, startTransition] = useTransition();
  const [upgrading, setUpgrading] = useState(false);
  const full = tier === "full";

  const views = analytics.views;
  const unique = analytics.unique_visitors;
  const clicks = analytics.external_clicks;
  const ctr = clickThroughRate(clicks, views);
  const discoveryRate = discoveryConversion(analytics.profile_opens, analytics.impressions);
  const followRate = followConversion(analytics.follows, analytics.profile_opens || views);

  function setRange(next: AnalyticsRange) {
    startTransition(() => {
      router.push(`/analytics?range=${next}`);
    });
  }

  async function upgrade() {
    setUpgrading(true);
    const response = await fetch("/api/discovery/checkout", { method: "POST" });
    const payload = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
    setUpgrading(false);
    if (payload.url) {
      window.location.href = payload.url;
      return;
    }
    alert(payload.error ?? t.settingsPage.stripeMissing);
  }

  return (
    <div className="mx-auto w-full max-w-4xl pb-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="sz-display">{t.analyticsPage.title}</h1>
          <p className="mt-2 max-w-md text-sm text-white/45">
            {t.analyticsPage.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
          {ANALYTICS_RANGES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              disabled={pending}
              className={cn(
                "min-h-11 min-w-12 rounded-full px-3 text-xs tracking-[0.12em] text-white/40 transition-colors",
                range === item && "bg-white text-zinc-950",
              )}
            >
              {interpolate(t.analyticsPage.rangeD, { n: item })}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={t.analyticsPage.profileViews}
          value={views}
          hint={interpolate(t.analyticsPage.viewsToday, { n: analytics.views_today })}
          delta={percentChange(views, analytics.views_prev)}
          range={range}
        />
        <Stat
          label={t.analyticsPage.uniqueVisitors}
          value={unique}
          delta={percentChange(unique, analytics.unique_visitors_prev)}
          range={range}
        />
        <Stat
          label={t.analyticsPage.externalClicks}
          value={clicks}
          delta={percentChange(clicks, analytics.external_clicks_prev)}
          range={range}
        />
        <Stat label={t.analyticsPage.externalCtr} value={ctr == null ? "—" : `${ctr}%`} hint={t.analyticsPage.clicksPerViews} />
      </div>

      <section className="mt-6 rounded-[1.6rem] border border-white/[0.07] bg-white/[0.02] p-5">
        <p className="sz-label">{t.analyticsPage.viewsOverTime}</p>
        <AnalyticsViewsChart data={analytics.views_over_time} />
      </section>

      {full ? (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Stat
              label={t.analyticsPage.followers}
              value={analytics.followers_total}
              hint={interpolate(t.analyticsPage.newThisPeriod, { n: analytics.new_followers })}
            />
            <Stat
              label={t.analyticsPage.profileOpens}
              value={analytics.profile_opens}
              hint={followRate != null ? interpolate(t.analyticsPage.followConversion, { n: followRate }) : t.analyticsPage.fromExploreSearch}
            />
            <Stat
              label={t.analyticsPage.discoveryImpressions}
              value={analytics.impressions}
              hint={discoveryRate != null ? interpolate(t.analyticsPage.openRate, { n: discoveryRate }) : t.analyticsPage.cardsSeen}
            />
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <section className="rounded-[1.6rem] border border-white/[0.07] bg-white/[0.02] p-5 lg:col-span-2">
              <p className="sz-label">{t.analyticsPage.trafficSources}</p>
              {analytics.traffic_sources.length ? (
                <>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <p className="text-sm text-white/70">
                      {t.analyticsPage.sharpzDiscovery}
                      <span className="ml-2 tabular-nums text-white/40">{analytics.traffic_split.discoveryShare}%</span>
                    </p>
                    <p className="text-sm text-white/70">
                      {t.analyticsPage.external}
                      <span className="ml-2 tabular-nums text-white/40">{analytics.traffic_split.externalShare}%</span>
                    </p>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-white/80"
                      style={{ width: `${analytics.traffic_split.discoveryShare}%` }}
                    />
                  </div>
                  <ul className="mt-5 space-y-3">
                    {analytics.traffic_sources.map((item) => {
                      const max = Math.max(1, ...analytics.traffic_sources.map((row) => row.count));
                      return (
                        <li key={item.key}>
                          <div className="mb-1 flex justify-between gap-3 text-sm text-white/70">
                            <span className="min-w-0 truncate">{t.traffic[item.key as keyof typeof t.traffic] ?? trafficSourceLabel(item.key)}</span>
                            <span className="shrink-0 tabular-nums text-white/50">
                              {item.count}
                              {item.share != null ? ` · ${item.share}%` : ""}
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <div className="h-full rounded-full bg-white/70" style={{ width: `${(item.count / max) * 100}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <p className="mt-4 text-sm text-white/35">{t.analyticsPage.noSources}</p>
              )}
            </section>
            <BarCard
              title={t.analyticsPage.clicksByPlatform}
              data={analytics.clicks_by_platform}
              labelFor={(key) => t.analyticsPage.platforms[key as keyof typeof t.analyticsPage.platforms] ?? platformLabel(key)}
            />
            <ListCard
              title={t.analyticsPage.topLinks}
              empty={t.analyticsPage.noClicks}
              items={analytics.top_links.map((item) => ({
                label: topLinkLabel(item),
                value: `${item.clicks}`,
                count: item.clicks,
              }))}
            />
            <section className="rounded-[1.6rem] border border-white/[0.07] bg-white/[0.02] p-5">
              <p className="sz-label">{t.analyticsPage.visitorNiches}</p>
              {analytics.visitor_niches.length ? (
                <ul className="mt-4 space-y-3">
                  {analytics.visitor_niches.map((item) => (
                    <li key={item.slug} className="flex items-center justify-between text-sm text-white/70">
                      <span>{item.name || item.slug}</span>
                      <span className="tabular-nums text-white/45">{item.share}%</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-white/35">{t.analyticsPage.notEnoughVisitors}</p>
              )}
            </section>
          </div>

          <section className="mt-3 rounded-[1.6rem] border border-white/[0.07] bg-white/[0.02] p-5">
            <p className="sz-label">{t.analyticsPage.conversions}</p>
            <p className="mt-2 text-sm text-white/40">{t.analyticsPage.conversionsHint}</p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">{t.analyticsPage.ctaClicks}</p>
                <p className="mt-2 font-[family-name:var(--font-zg-display)] text-3xl text-white">{analytics.cta_clicks}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">{t.analyticsPage.ctaConversion}</p>
                <p className="mt-2 font-[family-name:var(--font-zg-display)] text-3xl text-white">
                  {analytics.cta_ctr == null ? "—" : `${analytics.cta_ctr}%`}
                </p>
                <p className="mt-1 text-xs text-white/35">{t.analyticsPage.ctaClicksPerViews}</p>
              </div>
            </div>
            {analytics.cta_clicks === 0 && analytics.block_clicks.length === 0 ? (
              <p className="mt-5 text-sm text-white/35">{t.analyticsPage.noConversionClicks}</p>
            ) : (
              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">{t.analyticsPage.topBlock}</p>
                  {analytics.top_converting_block ? (
                    <p className="mt-2 text-sm text-white/70">
                      {analytics.top_converting_block.label}
                      <span className="ml-2 tabular-nums text-white/45">{analytics.top_converting_block.count}</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-white/35">{t.analyticsPage.noBlockClicks}</p>
                  )}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">{t.analyticsPage.clicksByBlock}</p>
                  {analytics.block_clicks.length ? (
                    <ul className="mt-3 space-y-3">
                      {analytics.block_clicks.map((item) => {
                        const max = Math.max(1, ...analytics.block_clicks.map((row) => row.count));
                        return (
                          <li key={item.key}>
                            <div className="mb-1 flex justify-between gap-3 text-sm text-white/70">
                              <span className="min-w-0 truncate">{item.label}</span>
                              <span className="shrink-0 tabular-nums text-white/50">{item.count}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className="h-full rounded-full bg-white/70"
                                style={{ width: `${(item.count / max) * 100}%` }}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-white/35">{t.analyticsPage.noBlockClicks}</p>
                  )}
                </div>
              </div>
            )}
          </section>
        </>
      ) : (
        <div className="mt-6 rounded-[1.6rem] border border-white/[0.08] bg-[#0d0c12] p-6 text-center">
          <p className="font-[family-name:var(--font-zg-display)] text-2xl text-white">{t.analyticsPage.unlockTitle}</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-white/50">
            {interpolate(t.analyticsPage.unlockText, { price: SHARPZ_PRO_PRICE_LABEL })}
          </p>
          <Button className="mt-5" onClick={() => void upgrade()} disabled={upgrading}>
            {t.analyticsPage.upgrade}
          </Button>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  delta,
  range,
}: {
  label: string;
  value: number | string;
  hint?: string;
  delta?: number | null;
  range?: AnalyticsRange;
}) {
  const { t } = useI18n();
  const deltaLabel = formatDelta(delta ?? null);
  return (
    <div className="rounded-[1.6rem] border border-white/[0.07] bg-white/[0.025] p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/35">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-zg-display)] text-3xl text-white">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/35">
        {deltaLabel ? (
          <span className={cn(delta && delta > 0 ? "text-white/70" : "text-white/40")}>
            {deltaLabel}
            {range ? ` ${interpolate(t.analyticsPage.vsPrevious, { n: range })}` : ""}
          </span>
        ) : null}
        {hint ? <span>{hint}</span> : null}
      </div>
    </div>
  );
}

function BarCard({
  title,
  data,
  labelFor,
}: {
  title: string;
  data: Record<string, number>;
  labelFor: (key: string) => string;
}) {
  const { t } = useI18n();
  const entries = Object.entries(data)
    .map(([key, n]) => [labelFor(key), n] as const)
    .sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, n]) => n));
  return (
    <section className="rounded-[1.6rem] border border-white/[0.07] bg-white/[0.02] p-5">
      <p className="sz-label">{title}</p>
      {entries.length ? (
        <ul className="mt-4 space-y-3">
          {entries.map(([label, n]) => (
            <li key={label}>
              <div className="mb-1 flex justify-between text-sm text-white/70">
                <span>{label}</span>
                <span className="tabular-nums">{n}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-white/70" style={{ width: `${(n / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-white/35">{t.analyticsPage.noData}</p>
      )}
    </section>
  );
}

function ListCard({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { label: string; value: string; count: number }[];
}) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return (
    <section className="rounded-[1.6rem] border border-white/[0.07] bg-white/[0.02] p-5">
      <p className="sz-label">{title}</p>
      {items.length ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex justify-between gap-3 text-sm text-white/70">
                <span className="min-w-0 truncate">{item.label}</span>
                <span className="shrink-0 tabular-nums text-white/50">{item.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full rounded-full bg-white/70" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-white/35">{empty}</p>
      )}
    </section>
  );
}
