"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe2 } from "lucide-react";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { OpportunityCard } from "@/src/components/sharpz/opportunity-card";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import type { Competitor, CompetitorChange, SharpzOpportunity } from "@/src/lib/sharpz/types";

type Props = {
  competitors: Competitor[];
  changes: CompetitorChange[];
  opportunities: SharpzOpportunity[];
  embedded?: boolean;
};

export function MarketView({ competitors, changes, opportunities, embedded = false }: Props) {
  const { t, locale } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";

  const newCompetitors = competitors.filter((item) => item.status === "new");
  const trends = opportunities.filter((item) => item.category === "market_trend");
  const products = opportunities.filter((item) => item.category === "new_product");
  const shifts = opportunities.filter((item) => item.category === "market_shift");

  async function addCompetitor(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/sharpz/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, url }),
    });
    setPending(false);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    setName("");
    setUrl("");
    showToast({ message: t.common.saved });
    router.refresh();
  }

  const inner = (
    <>
      {embedded ? null : <PageHeader title={t.marketPage.title} subtitle={t.marketPage.subtitle} />}

      <Card>
        <CardHeader>
          <CardTitle>{t.marketPage.competitors}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={addCompetitor}>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t.marketPage.competitorName}
              required
            />
            <Input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={t.marketPage.competitorUrl}
            />
            <Button type="submit" size="sm" disabled={pending}>
              {t.marketPage.addCompetitor}
            </Button>
          </form>
          {competitors.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-zg-text-muted">
                  <tr>
                    <th className="pb-3 pr-4">{t.marketPage.competitorName}</th>
                    <th className="pb-3 pr-4">{t.marketPage.competitorUrl}</th>
                    <th className="pb-3 pr-4">{t.marketPage.positioning}</th>
                    <th className="pb-3 pr-4">{t.marketPage.pricing}</th>
                    <th className="pb-3">{t.marketPage.lastChecked}</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((item) => (
                    <tr key={item.id} className="border-t border-zg-border">
                      <td className="py-3 pr-4 font-medium text-zg-fg">{item.name}</td>
                      <td className="py-3 pr-4 text-zg-text-secondary">{item.url ?? "—"}</td>
                      <td className="py-3 pr-4 text-zg-text-secondary">{item.positioning ?? "—"}</td>
                      <td className="py-3 pr-4 text-zg-text-secondary">{item.pricing ?? "—"}</td>
                      <td className="py-3 text-zg-text-muted">
                        {item.lastCheckedAt ? new Date(item.lastCheckedAt).toLocaleDateString(dateLocale) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <SharpzEmptyPanel
              title={t.empty.noCompetitorsTitle}
              description={t.empty.noCompetitorsDescription}
              icon={Globe2}
              className="min-h-[180px]"
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.marketPage.changes}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {changes.length ? (
              changes.map((item) => (
                <div key={item.id} className="rounded-xl border border-zg-border p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={item.importance === "high" ? "danger" : "warning"}>{item.importance}</Badge>
                    <span className="text-xs text-zg-text-muted">
                      {new Date(item.createdAt).toLocaleDateString(dateLocale)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-zg-fg">{item.whatChanged}</p>
                  {item.whyItMatters ? <p className="mt-1 text-sm text-zg-text-secondary">{item.whyItMatters}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-zg-text-muted">{t.empty.noAlertsDescription}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.marketPage.newCompetitors}</CardTitle>
          </CardHeader>
          <CardContent>
            {newCompetitors.length ? (
              <ul className="space-y-2">
                {newCompetitors.map((item) => (
                  <li key={item.id} className="text-sm text-zg-fg">
                    {item.name} {item.url ? `· ${item.url}` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zg-text-muted">{t.empty.noCompetitorsDescription}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zg-fg">{t.marketPage.trends}</h2>
        {trends.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {trends.map((item) => (
              <OpportunityCard key={item.id} opportunity={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zg-text-muted">{t.empty.noOpportunitiesDescription}</p>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zg-fg">{t.marketPage.products}</h2>
        {products.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((item) => (
              <OpportunityCard key={item.id} opportunity={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zg-text-muted">{t.empty.noOpportunitiesDescription}</p>
        )}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t.marketPage.evolution}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-zg-text-muted">{t.marketPage.patterns}</p>
            <p className="mt-2 text-sm text-zg-text-secondary">
              {shifts.length ? shifts.map((item) => item.name).join(" · ") : t.common.none}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zg-text-muted">{t.dashboard.recentOpportunities}</p>
            <p className="mt-2 text-sm text-zg-text-secondary">{opportunities.length}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-zg-text-muted">{t.marketPage.threats}</p>
            <p className="mt-2 text-sm text-zg-text-secondary">
              {changes.filter((item) => item.importance === "high").length || t.common.none}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );

  if (embedded) return <div className="space-y-8">{inner}</div>;
  return <DashboardContent>{inner}</DashboardContent>;
}
