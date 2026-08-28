"use client";

import { useRouter } from "next/navigation";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Tabs from "@/src/components/ui/tabs";
import { AnalyseView } from "@/src/components/sharpz/analyse/analyse-view";
import { AnalyticsOverviewView } from "@/src/components/sharpz/analytics/analytics-overview-view";
import { AnalyticsTrafficView } from "@/src/components/sharpz/analytics/analytics-traffic-view";
import { ContentView } from "@/src/components/sharpz/content/content-view";
import { MarketView } from "@/src/components/sharpz/market/market-view";
import { BarChart3 } from "lucide-react";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { analyticsHref, type AnalyticsTab } from "@/src/lib/sharpz/routes";
import type { TrafficSummary } from "@/src/lib/sharpz/analytics";
import type {
  AuditFinding,
  AuditRecord,
  Competitor,
  CompetitorChange,
  ContentIdea,
  ContentOpportunity,
  SharpzAction,
} from "@/src/lib/sharpz/types";

type Props = {
  tab: AnalyticsTab;
  lastAudit: AuditRecord | null;
  findings: AuditFinding[];
  recommendedActions: SharpzAction[];
  traffic: TrafficSummary;
  snippet: string;
  stripeConnected: boolean;
  competitors: Competitor[];
  changes: CompetitorChange[];
  contentOpportunities: ContentOpportunity[];
  contentIdeas: ContentIdea[];
};

export function AnalyticsView({
  tab,
  lastAudit,
  findings,
  recommendedActions,
  traffic,
  snippet,
  stripeConnected,
  competitors,
  changes,
  contentOpportunities,
  contentIdeas,
}: Props) {
  const { t } = useDashboardI18n();
  const router = useRouter();

  return (
    <DashboardContent width="wide" className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-zg-fg">{t.analyticsPage.title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zg-text-secondary">{t.analyticsPage.subtitle}</p>
        </div>
        <Tabs
          value={tab}
          onChange={(value) => router.replace(analyticsHref(value as AnalyticsTab))}
          tabs={[
            { id: "overview", label: t.analyticsPage.tabOverview },
            { id: "traffic", label: t.analyticsPage.tabTraffic },
            { id: "revenue", label: t.analyticsPage.tabRevenue },
            { id: "saas", label: t.analyticsPage.tabSaas },
            { id: "market", label: t.analyticsPage.tabMarket },
            { id: "content", label: t.analyticsPage.tabContent },
          ]}
        />
      </header>

      {tab === "overview" ? (
        <AnalyticsOverviewView
          traffic={traffic}
          auditScore={lastAudit?.globalScore ?? null}
          hasVerifiedAudit={Boolean(lastAudit)}
          stripeConnected={stripeConnected}
        />
      ) : null}
      {tab === "traffic" ? <AnalyticsTrafficView traffic={traffic} snippet={snippet} /> : null}
      {tab === "revenue" ? (
        stripeConnected ? (
          <AnalyticsTabEmpty
            title={t.analyticsPage.revenueConnectedTitle}
            description={t.analyticsPage.revenueConnectedDescription}
          />
        ) : (
          <AnalyticsTabEmpty
            title={t.analyticsPage.revenueEmptyTitle}
            description={t.analyticsPage.revenueEmptyDescription}
          />
        )
      ) : null}
      {tab === "saas" ? (
        <AnalyseView
          embedded
          lastAudit={lastAudit}
          findings={findings}
          recommendedActions={recommendedActions}
        />
      ) : null}
      {tab === "market" ? (
        competitors.length || changes.length ? (
          <MarketView embedded competitors={competitors} changes={changes} opportunities={[]} />
        ) : (
          <AnalyticsTabEmpty
            title={t.analyticsPage.marketEmptyTitle}
            description={t.analyticsPage.marketEmptyDescription}
          />
        )
      ) : null}
      {tab === "content" ? (
        contentOpportunities.length || contentIdeas.length ? (
          <ContentView embedded opportunities={contentOpportunities} ideas={contentIdeas} />
        ) : (
          <AnalyticsTabEmpty
            title={t.analyticsPage.contentEmptyTitle}
            description={t.analyticsPage.contentEmptyDescription}
          />
        )
      ) : null}
    </DashboardContent>
  );
}

function AnalyticsTabEmpty({
  title,
  description,
  icon: Icon = BarChart3,
}: {
  title: string;
  description: string;
  icon?: typeof BarChart3;
}) {
  return (
    <section className="flex min-h-[380px] items-center justify-center zg-surface-panel p-8 text-center">
      <div className="max-w-md">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.04]">
          <Icon className="h-5 w-5 text-zg-text-secondary" strokeWidth={1.6} />
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-zg-fg">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-zg-text-secondary">{description}</p>
      </div>
    </section>
  );
}
