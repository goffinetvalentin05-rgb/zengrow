"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Tabs from "@/src/components/ui/tabs";
import { AnalyseView } from "@/src/components/sharpz/analyse/analyse-view";
import { MarketView } from "@/src/components/sharpz/market/market-view";
import { ContentView } from "@/src/components/sharpz/content/content-view";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import type {
  AuditFinding,
  AuditRecord,
  Competitor,
  CompetitorChange,
  ContentIdea,
  ContentOpportunity,
  SharpzAction,
  SharpzOpportunity,
} from "@/src/lib/sharpz/types";

type Tab = "analyse" | "market" | "content";

type Props = {
  tab: Tab;
  lastAudit: AuditRecord | null;
  findings: AuditFinding[];
  recommendedActions: SharpzAction[];
  competitors: Competitor[];
  changes: CompetitorChange[];
  opportunities: SharpzOpportunity[];
  contentOpportunities: ContentOpportunity[];
  ideas: ContentIdea[];
};

export function IntelligenceView({
  tab,
  lastAudit,
  findings,
  recommendedActions,
  competitors,
  changes,
  opportunities,
  contentOpportunities,
  ideas,
}: Props) {
  const { t } = useDashboardI18n();
  const router = useRouter();

  return (
    <DashboardContent width="wide">
      <PageHeader title={t.intelligencePage.title} subtitle={t.intelligencePage.subtitle}>
        <Tabs
          value={tab}
          onChange={(value) => router.replace(`/dashboard/intelligence?tab=${value}`)}
          tabs={[
            { id: "analyse", label: t.intelligencePage.tabAnalyse },
            { id: "market", label: t.intelligencePage.tabMarket },
            { id: "content", label: t.intelligencePage.tabContent },
          ]}
        />
      </PageHeader>

      {tab === "analyse" ? (
        <AnalyseView
          embedded
          lastAudit={lastAudit}
          findings={findings}
          recommendedActions={recommendedActions}
        />
      ) : null}
      {tab === "market" ? (
        <MarketView embedded competitors={competitors} changes={changes} opportunities={opportunities} />
      ) : null}
      {tab === "content" ? (
        <ContentView embedded opportunities={contentOpportunities} ideas={ideas} />
      ) : null}
    </DashboardContent>
  );
}
