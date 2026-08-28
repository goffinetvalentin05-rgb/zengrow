"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect } from "react";
import { AlertTriangle, ArrowRight, Bot, Sparkles, Target, Users } from "lucide-react";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { useSetDashboardTitle } from "@/src/components/dashboard/dashboard-title-context";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import { useCopilot } from "@/src/components/sharpz/copilot/copilot-context";
import EmptyState from "@/src/components/ui/empty-state";
import { ScorePills } from "@/src/components/sharpz/score-pills";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { SHARPZ_ROUTES } from "@/src/lib/sharpz/routes";
import type { SharpzAction } from "@/src/lib/sharpz/types";
import type { AttentionSignal } from "@/src/lib/sharpz/signals";
import { cn } from "@/src/lib/utils";

function fill(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

type Props = {
  saasName: string | null;
  saasStageKey: string | null;
  primaryObjectiveKey: string | null;
  dayActions: SharpzAction[];
  signals: AttentionSignal[];
  doneCount: number;
  doneTodayCount: number;
  openCount: number;
  followUpProspectCount: number;
  visitors7d: number | null;
  focusCategoryKey: string | null;
  hasVerifiedAudit: boolean;
  auditScore: number | null;
};

export function TodayView({
  saasName,
  saasStageKey,
  primaryObjectiveKey,
  dayActions,
  signals,
  doneCount,
  doneTodayCount,
  openCount,
  followUpProspectCount,
  visitors7d,
  focusCategoryKey,
  hasVerifiedAudit,
  auditScore,
}: Props) {
  const { t } = useDashboardI18n();
  const { send, pending } = useCopilot();
  const router = useRouter();
  const showToast = useDashboardToast();
  const setDashboardTitle = useSetDashboardTitle();

  useLayoutEffect(() => {
    if (!setDashboardTitle) return;
    setDashboardTitle({ title: t.nav.dashboard, subtitle: t.dashboardPage.subtitle });
    return () => setDashboardTitle(null);
  }, [setDashboardTitle, t.nav.dashboard, t.dashboardPage.subtitle]);

  const primaryObjective = primaryObjectiveKey
    ? t.objectives[primaryObjectiveKey as keyof typeof t.objectives] ?? primaryObjectiveKey
    : t.common.none;
  const focusCategory = focusCategoryKey
    ? t.categories[focusCategoryKey as keyof typeof t.categories] ?? focusCategoryKey
    : null;
  const saasStage = saasStageKey
    ? t.stages[saasStageKey as keyof typeof t.stages] ?? saasStageKey
    : null;

  async function updateStatus(id: string, status: "done" | "ignored" | "in_progress") {
    const response = await fetch(`/api/sharpz/actions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    if (status === "in_progress") {
      showToast({ message: t.today.postponedToast });
    }
    router.refresh();
  }

  function launchAction(action: SharpzAction) {
    const prompt = fill(t.today.launchPrompt, {
      title: action.title,
      why: action.why || t.common.none,
      how: action.howTo || t.common.none,
    });
    void send(prompt);
    router.push(SHARPZ_ROUTES.agent);
  }

  function askAgentForPlan() {
    void send(t.today.suggestionPlanPrompt);
    router.push(SHARPZ_ROUTES.agent);
  }

  const pulse =
    doneCount > 0
      ? fill(t.today.pulseSummary, {
          done: doneCount,
          open: openCount,
          focus: focusCategory ?? t.common.none,
        })
      : null;

  const snapshot = [
    { label: t.today.doneToday, value: doneTodayCount },
    { label: t.today.followUpProspects, value: followUpProspectCount },
    { label: t.today.auditScore, value: auditScore != null ? auditScore : t.dashboardPage.noTraffic },
    { label: t.dashboardPage.visitors7d, value: visitors7d != null ? visitors7d : t.dashboardPage.noTraffic },
  ];

  return (
    <DashboardContent width="wide" className="space-y-8 pb-4">
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zg-muted">
          {t.nav.dashboard}
        </p>
        <h1 className="mt-2 text-[1.85rem] font-semibold leading-[1.12] tracking-tight text-zg-fg sm:text-[2.15rem]">
          {t.dashboardPage.title}
        </h1>
        <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-zg-text-secondary">
          {t.dashboardPage.subtitle}
        </p>
      </header>

      <section className="zg-surface-panel overflow-hidden">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.06] px-6 py-5 sm:px-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zg-muted">
              {t.dashboardPage.snapshotTitle}
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-zg-fg">
              {saasName?.trim() || t.dashboardPage.saasUntitled}
            </p>
            <p className="mt-1 text-sm text-zg-text-secondary">
              {primaryObjective}
              {saasStage ? ` · ${saasStage}` : ""}
            </p>
          </div>
          <p className="text-xs tabular-nums text-zg-muted">
            {openCount} {t.dashboardPage.openActions.toLowerCase()}
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4">
          {snapshot.map((item, index) => (
            <div
              key={item.label}
              className={cn(
                "px-6 py-5 sm:px-7",
                index % 2 === 1 && "border-l border-white/[0.06]",
                index >= 2 && "border-t border-white/[0.06] sm:border-t-0",
                index >= 1 && "sm:border-l sm:border-white/[0.06]",
              )}
            >
              <p className="text-xs text-zg-muted">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-zg-fg">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.72fr)]">
        <section className="zg-surface-panel overflow-hidden">
          <div className="flex items-end justify-between gap-4 border-b border-white/[0.07] px-6 py-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#cbb4dc]">
                {t.today.executionKicker}
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-zg-fg">{t.today.planTitle}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-zg-text-secondary">{t.today.planSubtitle}</p>
            </div>
            <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs tabular-nums text-zg-muted">
              {dayActions.length}/5
            </span>
          </div>

          {dayActions.length ? (
            <ol className="divide-y divide-white/[0.06]">
              {dayActions.map((action, index) => {
                const isPrimary = index === 0;
                return (
                  <li
                    key={action.id}
                    className={cn("group relative px-6 py-6", isPrimary && "bg-white/[0.015]")}
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex flex-col items-center self-stretch">
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums",
                            isPrimary
                              ? "border-white/20 bg-white text-zinc-950"
                              : "border-white/[0.1] text-zg-text-secondary",
                          )}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {index < dayActions.length - 1 ? (
                          <span className="mt-2 w-px flex-1 bg-white/[0.06]" aria-hidden />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        {isPrimary ? (
                          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zg-muted">
                            {t.today.primaryMission}
                          </p>
                        ) : null}
                        <div className={cn("flex flex-wrap items-center gap-2", isPrimary && "mt-2")}>
                          <Badge>
                            {t.categories[action.category as keyof typeof t.categories] ?? action.category}
                          </Badge>
                          <Badge tone={action.status === "in_progress" ? "warning" : "neutral"}>
                            {t.statuses[action.status]}
                          </Badge>
                        </div>
                        <h3
                          className={cn(
                            "mt-3 font-semibold leading-snug tracking-tight text-zg-fg",
                            isPrimary ? "text-xl" : "text-[17px]",
                          )}
                        >
                          {action.title}
                        </h3>
                        {action.why ? (
                          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zg-text-secondary">
                            {action.why}
                          </p>
                        ) : null}
                        <ScorePills
                          className="mt-4"
                          impact={action.impact}
                          effort={action.effort}
                          confidence={action.confidence}
                          score={action.score}
                          labels={{
                            impact: t.common.impact,
                            effort: t.common.effort,
                            confidence: t.common.confidence,
                            score: t.common.score,
                          }}
                        />
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                          <Button type="button" size="sm" onClick={() => launchAction(action)} disabled={pending}>
                            <Sparkles />
                            {t.today.launchWithAgent}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => void updateStatus(action.id, "done")}
                          >
                            {t.actionsPage.markDone}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => void updateStatus(action.id, "in_progress")}
                          >
                            {t.today.postpone}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => void updateStatus(action.id, "ignored")}
                          >
                            {t.actionsPage.markIgnored}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="px-6 py-10">
              <EmptyState
                title={t.empty.noActionsTitle}
                description={t.today.noPlanHonest}
                icon={Target}
                action={
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {hasVerifiedAudit ? (
                      <button
                        type="button"
                        onClick={askAgentForPlan}
                        className="inline-flex items-center gap-2 text-sm text-zg-fg hover:underline"
                      >
                        <Bot className="h-4 w-4" />
                        {t.today.askAgentForPlan}
                      </button>
                    ) : (
                      <Link
                        href={`${SHARPZ_ROUTES.analytics}?tab=saas`}
                        className="inline-flex items-center gap-2 text-sm text-zg-fg"
                      >
                        {t.common.launchAnalysis}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                }
              />
            </div>
          )}
        </section>

        <aside className="space-y-5 xl:sticky xl:top-2">
          <section className="zg-surface-panel p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zg-muted">
              {t.today.currentFocus}
            </p>
            <p className="mt-3 text-base font-medium text-zg-fg">{focusCategory ?? t.common.none}</p>
            <p className={cn("mt-3 text-sm leading-relaxed", pulse ? "text-zg-text-secondary" : "text-zg-muted")}>
              {pulse ?? t.today.pulseEmpty}
            </p>
          </section>

          <section className="zg-surface-panel p-6">
            <h2 className="text-sm font-semibold text-zg-fg">{t.today.attentionTitle}</h2>
            {signals.length ? (
              <ul className="mt-3 divide-y divide-white/[0.06]">
                {signals.map((signal) => (
                  <li key={signal.id}>
                    <Link href={signal.href} className="-mx-2 flex gap-2.5 rounded-xl px-2 py-3 hover:bg-white/[0.03]">
                      {signal.id.startsWith("prospect-") ? (
                        <Users className="mt-0.5 h-4 w-4 shrink-0 text-zg-text-secondary" strokeWidth={1.75} />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-zg-warning" strokeWidth={1.75} />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zg-fg">{signal.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zg-text-secondary">
                          {signal.detail}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-zg-muted">{t.today.attentionEmptyHonest}</p>
            )}
            {followUpProspectCount > 0 ? (
              <Link
                href={SHARPZ_ROUTES.prospects}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-zg-fg hover:underline"
              >
                {t.today.viewProspects}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : null}
          </section>
        </aside>
      </div>
    </DashboardContent>
  );
}
