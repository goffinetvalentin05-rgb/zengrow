"use client";

import Link from "next/link";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";
import type { StripeRevenueSummary } from "@/src/lib/sharpz/stripe-revenue";

type Props = {
  revenue: StripeRevenueSummary | null;
};

function money(cents: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function AnalyticsRevenueView({ revenue }: Props) {
  const { t, locale } = useDashboardI18n();

  if (!revenue) {
    return (
      <section className="zg-surface-panel p-8">
        <h2 className="text-lg font-semibold text-zg-fg">{t.analyticsPage.revenueEmptyTitle}</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zg-text-secondary">
          {t.analyticsPage.revenueEmptyDescription}
        </p>
        <Link
          href={`${SHARPZ_ROUTES.settings}?section=integrations`}
          className="mt-5 inline-flex text-sm text-[#cbb4dc] hover:underline"
        >
          {t.analyticsPage.openSettings} →
        </Link>
      </section>
    );
  }

  return (
    <section className="zg-surface-panel overflow-hidden">
      <div className="border-b border-white/[0.06] px-7 py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zg-muted">
          {t.analyticsPage.tabRevenue}
        </p>
        <p className="mt-2 text-sm text-zg-text-secondary">
          {revenue.livemode ? t.settingsPage.stripeLive : t.settingsPage.stripeTest}
          {revenue.stale ? ` · ${t.analyticsPage.revenueStale}` : ""}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3">
        <div className="px-7 py-6 sm:border-r sm:border-white/[0.06]">
          <p className="text-xs text-zg-muted">{t.analyticsPage.mrrLabel}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-zg-fg">
            {money(revenue.mrrCents, revenue.currency, locale)}
          </p>
        </div>
        <div className="border-t border-white/[0.06] px-7 py-6 sm:border-t-0 sm:border-r">
          <p className="text-xs text-zg-muted">{t.analyticsPage.revenueSubscriptions}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-zg-fg">
            {revenue.activeSubscriptions}
          </p>
        </div>
        <div className="border-t border-white/[0.06] px-7 py-6 sm:border-t-0">
          <p className="text-xs text-zg-muted">{t.analyticsPage.revenueVolume30d}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-zg-fg">
            {revenue.volume30dCents != null
              ? money(revenue.volume30dCents, revenue.currency, locale)
              : t.dashboardPage.noTraffic}
          </p>
        </div>
      </div>
      <p className="border-t border-white/[0.06] px-7 py-4 text-xs text-zg-muted">
        {t.analyticsPage.overviewHonesty}
      </p>
    </section>
  );
}
