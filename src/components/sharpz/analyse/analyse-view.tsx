"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Radar } from "lucide-react";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import StatCard from "@/src/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import Badge from "@/src/components/ui/badge";
import { ActionCard } from "@/src/components/sharpz/action-card";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import type { AuditFinding, AuditRecord, SharpzAction } from "@/src/lib/sharpz/types";

type Props = {
  lastAudit: AuditRecord | null;
  findings: AuditFinding[];
  recommendedActions: SharpzAction[];
  embedded?: boolean;
};

const SUBSCORE_KEYS = ["landing", "ux", "seo", "positioning", "conversion", "retention"] as const;

export function AnalyseView({ lastAudit, findings, recommendedActions, embedded = false }: Props) {
  const { t, locale } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const [running, setRunning] = useState(false);
  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";

  async function runAudit() {
    setRunning(true);
    const response = await fetch("/api/sharpz/audit", { method: "POST" });
    setRunning(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      showToast({ message: data?.error ?? t.common.error });
      return;
    }
    showToast({ message: t.common.saved });
    router.refresh();
  }

  const problems = findings.filter((item) => item.kind === "problem");
  const opportunities = findings.filter((item) => item.kind === "opportunity");
  const delta =
    lastAudit?.globalScore != null && lastAudit.previousScore != null
      ? lastAudit.globalScore - lastAudit.previousScore
      : null;

  const inner = (
    <>
      {embedded ? (
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => void runAudit()}
            disabled={running}
            className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-zinc-950 transition-colors hover:bg-zinc-200 disabled:opacity-50"
          >
            {running ? t.analysePage.running : t.common.launchAnalysis}
          </button>
        </div>
      ) : (
        <PageHeader
          title={t.analysePage.title}
          subtitle={t.analysePage.subtitle}
          primaryAction={{
            kind: "button",
            label: running ? t.analysePage.running : t.common.launchAnalysis,
            onClick: runAudit,
            disabled: running,
          }}
        />
      )}

      {!lastAudit ? (
        <SharpzEmptyPanel
          title={t.empty.noAuditTitle}
          description={t.empty.noAuditDescription}
          icon={Radar}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label={t.analysePage.globalScore}
              value={lastAudit.globalScore ?? "—"}
              icon={Radar}
              dataTone="accent"
            />
            <StatCard
              label={t.analysePage.previousScore}
              value={lastAudit.previousScore ?? "—"}
              icon={Radar}
              dataTone="info"
            />
            <StatCard
              label={t.analysePage.lastAuditDate}
              value={new Date(lastAudit.createdAt).toLocaleDateString(dateLocale)}
              icon={Radar}
              dataTone="premium"
              trend={delta == null ? undefined : `${delta > 0 ? "+" : ""}${delta}`}
              trendTone={delta == null ? "muted" : delta >= 0 ? "success" : "danger"}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t.analysePage.summary}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-zg-text-secondary">{lastAudit.summary}</p>
              <p className="mt-3 text-sm text-zg-text-muted">
                {delta == null ? t.analysePage.noChange : `${t.analysePage.changes}: ${delta > 0 ? "+" : ""}${delta}`}
              </p>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="text-base font-semibold text-zg-fg">{t.analysePage.subscores}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SUBSCORE_KEYS.map((key) => (
                <div key={key} className="rounded-2xl border border-zg-border bg-zg-surface p-4">
                  <p className="text-xs uppercase tracking-wider text-zg-text-muted">{t.analysePage[key]}</p>
                  <p className="mt-2 text-2xl font-semibold tabular-nums text-zg-fg">
                    {lastAudit.subscores[key] ?? "—"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t.analysePage.problems}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {problems.length ? (
                  problems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-zg-border p-4">
                      <div className="flex items-center gap-2">
                        <Badge tone="danger">{item.area}</Badge>
                        {item.severity != null ? <Badge tone="warning">{item.severity}/10</Badge> : null}
                      </div>
                      <p className="mt-2 text-sm font-medium text-zg-fg">{item.title}</p>
                      {item.detail ? <p className="mt-1 text-sm text-zg-text-secondary">{item.detail}</p> : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zg-text-muted">{t.common.none}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t.analysePage.opportunities}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {opportunities.length ? (
                  opportunities.map((item) => (
                    <div key={item.id} className="rounded-xl border border-zg-border p-4">
                      <Badge tone="success">{item.area}</Badge>
                      <p className="mt-2 text-sm font-medium text-zg-fg">{item.title}</p>
                      {item.detail ? <p className="mt-1 text-sm text-zg-text-secondary">{item.detail}</p> : null}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zg-text-muted">{t.common.none}</p>
                )}
              </CardContent>
            </Card>
          </div>

          <section className="space-y-4">
            <h2 className="text-base font-semibold text-zg-fg">{t.analysePage.recommended}</h2>
            {recommendedActions.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {recommendedActions.map((action) => (
                  <ActionCard key={action.id} action={action} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-zg-text-muted">{t.empty.noActionsDescription}</p>
            )}
          </section>
        </>
      )}
    </>
  );

  if (embedded) return <div className="space-y-8">{inner}</div>;
  return <DashboardContent>{inner}</DashboardContent>;
}
