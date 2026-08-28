"use client";

import { useState } from "react";
import { PenLine } from "lucide-react";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Tabs from "@/src/components/ui/tabs";
import Badge from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import type { ContentIdea, ContentOpportunity } from "@/src/lib/sharpz/types";

type Props = {
  opportunities: ContentOpportunity[];
  ideas: ContentIdea[];
};

export function ContentView({ opportunities, ideas }: Props) {
  const { t } = useDashboardI18n();
  const [tab, setTab] = useState("opportunities");

  return (
    <DashboardContent>
      <PageHeader title={t.contentPage.title} subtitle={t.contentPage.subtitle}>
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "opportunities", label: t.contentPage.opportunities },
            { id: "ideas", label: t.contentPage.ideas },
          ]}
        />
      </PageHeader>

      {tab === "opportunities" ? (
        opportunities.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {opportunities.map((item) => (
              <Card key={item.id} className="space-y-3 p-5">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="premium">
                    {t.common.potential} {item.potential ?? "—"}%
                  </Badge>
                  <Badge tone="accent">
                    {t.common.relevance} {item.relevance ?? "—"}%
                  </Badge>
                </div>
                <h3 className="text-base font-semibold text-zg-fg">{item.topic}</h3>
                {item.audience ? (
                  <p className="text-sm text-zg-text-muted">
                    {t.contentPage.audience}: {item.audience}
                  </p>
                ) : null}
                {item.whyNow ? (
                  <p className="text-sm leading-relaxed text-zg-text-secondary">
                    <span className="font-medium text-zg-fg">{t.contentPage.whyNow}: </span>
                    {item.whyNow}
                  </p>
                ) : null}
                {item.recommendedAngle ? (
                  <p className="text-sm leading-relaxed text-zg-text-secondary">
                    <span className="font-medium text-zg-fg">{t.contentPage.angle}: </span>
                    {item.recommendedAngle}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>
        ) : (
          <SharpzEmptyPanel title={t.empty.noContentTitle} description={t.empty.noContentDescription} icon={PenLine} />
        )
      ) : ideas.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {ideas.map((item) => (
            <Card key={item.id} className="space-y-3 p-5">
              <Badge tone="info">{item.platform}</Badge>
              <h3 className="text-base font-semibold text-zg-fg">{item.hook}</h3>
              {item.angle ? (
                <p className="text-sm text-zg-text-secondary">
                  {t.contentPage.angle}: {item.angle}
                </p>
              ) : null}
              {item.objective ? (
                <p className="text-sm text-zg-text-muted">
                  {t.contentPage.ideaObjective}: {item.objective}
                </p>
              ) : null}
              {item.format ? (
                <p className="text-sm text-zg-text-muted">
                  {t.contentPage.format}: {item.format}
                </p>
              ) : null}
              {item.cta ? <p className="text-sm text-zg-text-muted">CTA: {item.cta}</p> : null}
            </Card>
          ))}
        </div>
      ) : (
        <SharpzEmptyPanel title={t.empty.noContentTitle} description={t.empty.noContentDescription} icon={PenLine} />
      )}
    </DashboardContent>
  );
}
