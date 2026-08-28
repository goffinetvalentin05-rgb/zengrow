"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Bot, Sparkles, Target, Users } from "lucide-react";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import { useCopilot } from "@/src/components/sharpz/copilot/copilot-context";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
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
  primaryObjectiveKey: string | null;
  dayActions: SharpzAction[];
  signals: AttentionSignal[];
  doneCount: number;
  doneTodayCount: number;
  openCount: number;
  followUpProspectCount: number;
  focusCategoryKey: string | null;
  hasVerifiedAudit: boolean;
  auditScore: number | null;
};

export function TodayView({
  primaryObjectiveKey,
  dayActions,
  signals,
  doneCount,
  doneTodayCount,
  openCount,
  followUpProspectCount,
  focusCategoryKey,
  hasVerifiedAudit,
  auditScore,
}: Props) {
  const { t } = useDashboardI18n();
  const { send, pending } = useCopilot();
  const router = useRouter();
  const showToast = useDashboardToast();

  const primaryObjective = primaryObjectiveKey
    ? t.objectives[primaryObjectiveKey as keyof typeof t.objectives] ?? primaryObjectiveKey
    : t.common.none;
  const focusCategory = focusCategoryKey
    ? t.categories[focusCategoryKey as keyof typeof t.categories] ?? focusCategoryKey
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

  return (
    <DashboardContent width="wide" className="space-y-10 pb-8">
      <header className="max-w-3xl pt-4 md:pt-8">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zg-muted">
          {t.today.executionKicker}
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-zg-fg sm:text-4xl">
          {t.today.executionTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zg-text-secondary">
          {t.today.executionSubtitle}
        </p>
      </header>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.7fr)]">
        <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-end justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zg-fg">{t.today.planTitle}</h2>
              <p className="mt-1 text-sm text-zg-text-secondary">{t.today.planSubtitle}</p>
            </div>
            <span className="shrink-0 text-xs tabular-nums text-zg-muted">
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
                    className={cn(
                      "group relative px-6 py-6",
                      isPrimary && "bg-white/[0.02]",
                    )}
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
            <SharpzEmptyPanel
              className="border-0 bg-transparent"
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
          )}
        </section>

        <aside className="space-y-4 xl:sticky xl:top-4">
          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-zg-muted">{t.today.opsTitle}</p>
            <dl className="mt-4 space-y-3">
              <OpsRow label={t.today.currentObjective} value={primaryObjective} />
              <OpsRow
                label={t.today.doneToday}
                value={String(doneTodayCount)}
                highlight={doneTodayCount > 0}
              />
              <OpsRow
                label={t.today.followUpProspects}
                value={String(followUpProspectCount)}
                highlight={followUpProspectCount > 0}
              />
              <OpsRow
                label={t.today.auditScore}
                value={
                  auditScore != null
                    ? `${auditScore}/100`
                    : hasVerifiedAudit
                      ? t.common.unknown
                      : t.agentPage.missing
                }
              />
            </dl>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <p className="text-[11px] uppercase tracking-[0.14em] text-zg-muted">{t.today.currentFocus}</p>
            <p className="mt-3 text-base font-medium text-zg-fg">{focusCategory ?? t.common.none}</p>
            <p className={cn("mt-3 text-sm leading-relaxed", pulse ? "text-zg-text-secondary" : "text-zg-muted")}>
              {pulse ?? t.today.pulseEmpty}
            </p>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
            <h2 className="text-sm font-semibold text-zg-fg">{t.today.attentionTitle}</h2>
            {signals.length ? (
              <ul className="mt-3 divide-y divide-white/[0.06]">
                {signals.map((signal) => (
                  <li key={signal.id}>
                    <Link href={signal.href} className="-mx-2 flex gap-2.5 rounded-lg px-2 py-3 hover:bg-white/[0.03]">
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

function OpsRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-zg-muted">{label}</dt>
      <dd className={cn("text-sm font-medium tabular-nums", highlight ? "text-zg-fg" : "text-zg-text-secondary")}>
        {value}
      </dd>
    </div>
  );
}
