"use client";

import Link from "next/link";
import { Activity, AlertTriangle, CheckCircle2, Sparkles, Target, TrendingUp } from "lucide-react";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import StatCard from "@/src/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { buttonClassName } from "@/src/components/ui/button";
import Badge from "@/src/components/ui/badge";
import { ActionCard } from "@/src/components/sharpz/action-card";
import { OpportunityCard } from "@/src/components/sharpz/opportunity-card";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import type { AuditRecord, CompetitorChange, SharpzAction, SharpzOpportunity } from "@/src/lib/sharpz/types";

type Props = {
  topActions: SharpzAction[];
  opportunities: SharpzOpportunity[];
  alerts: CompetitorChange[];
  lastAudit: AuditRecord | null;
  hasConnectedData: boolean;
  actionsDone: number;
  actionsOpen: number;
  opportunitiesCount: number;
};

export function HomeDashboard({
  topActions,
  opportunities,
  alerts,
  lastAudit,
  hasConnectedData,
  actionsDone,
  actionsOpen,
  opportunitiesCount,
}: Props) {
  const { t, locale } = useDashboardI18n();
  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";

  return (
    <DashboardContent>
      <PageHeader
        title={t.dashboard.title}
        subtitle={t.dashboard.subtitle}
        secondaryActions={[{ kind: "link", href: "/dashboard/prospects", label: t.dashboard.seeProspects }]}
      />

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 row-span-2 lg:col-span-4">
          <div className="relative isolate flex h-full min-h-[240px] min-w-0 flex-col overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-[#7c5cff] via-[#6366f1] to-[#4f46e5] p-6 text-white shadow-[0_0_60px_-12px_rgba(124,92,255,0.55)]">
            <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10 opacity-40" />
            <p className="relative font-landing-serif text-xl italic leading-none text-white/95">{t.brand}</p>
            <p className="relative mt-auto text-sm font-medium text-white/85">{t.dashboard.highlightLabel}</p>
            <p className="zg-stat-value relative mt-2 text-5xl leading-none tracking-tight text-white tabular-nums sm:text-6xl">
              {lastAudit?.globalScore ?? "—"}
            </p>
            <p className="relative mt-3 text-xs font-medium text-white/70">{t.dashboard.highlightSub}</p>
            <Link
              href="/dashboard/analyse"
              className={buttonClassName({
                variant: "secondary",
                size: "sm",
                className:
                  "relative mt-6 w-full border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:w-auto",
              })}
            >
              {t.common.launchAnalysis}
            </Link>
          </div>
        </div>
        <div className="col-span-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
          <StatCard label={t.dashboard.actionsDone} value={actionsDone} icon={CheckCircle2} dataTone="success" />
          <StatCard label={t.dashboard.actionsOpen} value={actionsOpen} icon={Target} dataTone="accent" />
          <StatCard
            label={t.dashboard.opportunitiesCount}
            value={opportunitiesCount}
            icon={Sparkles}
            dataTone="premium"
          />
          <StatCard
            label={t.dashboard.lastAudit}
            value={lastAudit ? new Date(lastAudit.createdAt).toLocaleDateString(dateLocale) : "—"}
            icon={Activity}
            dataTone="info"
          />
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-base font-semibold text-zg-fg">{t.dashboard.topActions}</h2>
          <Link href="/dashboard/actions" className="text-sm font-medium text-zg-accent hover:underline">
            {t.dashboard.seeAllActions}
          </Link>
        </div>
        {topActions.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {topActions.map((action) => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        ) : (
          <SharpzEmptyPanel
            title={t.empty.noActionsTitle}
            description={t.empty.noActionsDescription}
            icon={Target}
            action={
              <Link href="/dashboard/analyse" className={buttonClassName({ variant: "primary", size: "sm" })}>
                {t.common.launchAnalysis}
              </Link>
            }
          />
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zg-fg">{t.dashboard.recentOpportunities}</h2>
        {opportunities.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {opportunities.slice(0, 4).map((item) => (
              <OpportunityCard key={item.id} opportunity={item} />
            ))}
          </div>
        ) : (
          <SharpzEmptyPanel
            title={t.empty.noOpportunitiesTitle}
            description={t.empty.noOpportunitiesDescription}
            icon={TrendingUp}
          />
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.importantAlerts}</CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length ? (
              <ul className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <li key={alert.id} className="rounded-xl border border-zg-border bg-zg-surface-elevated/50 p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-zg-warning" />
                      <Badge tone={alert.importance === "high" ? "danger" : "warning"}>{alert.importance}</Badge>
                      <span className="text-xs text-zg-text-muted">
                        {new Date(alert.createdAt).toLocaleDateString(dateLocale)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-zg-fg">{alert.whatChanged}</p>
                    {alert.whyItMatters ? (
                      <p className="mt-1 text-sm text-zg-text-secondary">{alert.whyItMatters}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zg-text-muted">{t.empty.noAlertsDescription}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.sinceLastAudit}</CardTitle>
          </CardHeader>
          <CardContent>
            {hasConnectedData ? (
              <p className="text-sm text-zg-text-secondary">
                {lastAudit?.previousScore != null && lastAudit.globalScore != null
                  ? `${t.analysePage.previousScore}: ${lastAudit.previousScore} → ${lastAudit.globalScore}`
                  : t.analysePage.noChange}
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-zg-text-secondary">{t.dashboard.connectDataCta}</p>
                <Link
                  href="/dashboard/settings?section=integrations"
                  className={buttonClassName({ variant: "secondary", size: "sm" })}
                >
                  {t.dashboard.openSettings}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardContent>
  );
}
