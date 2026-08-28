"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Sparkles, Target, X } from "lucide-react";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import { CopilotHero } from "@/src/components/sharpz/copilot/copilot-panel";
import { useCopilot } from "@/src/components/sharpz/copilot/copilot-context";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { ScorePills } from "@/src/components/sharpz/score-pills";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
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
  firstName: string | null;
  saasName: string | null;
  primaryObjectiveKey: string | null;
  actions: SharpzAction[];
  signals: AttentionSignal[];
  doneCount: number;
  openCount: number;
  doneThisWeek: number;
  focusCategoryKey: string | null;
};

export function TodayView({
  firstName,
  actions,
  signals,
  doneCount,
  openCount,
  doneThisWeek,
  focusCategoryKey,
}: Props) {
  const { t } = useDashboardI18n();
  const { send, focusInput, proposed, acceptProspect, dismissProspect, acceptingId, pending } = useCopilot();
  const router = useRouter();
  const showToast = useDashboardToast();

  const focusCategory = focusCategoryKey
    ? t.categories[focusCategoryKey as keyof typeof t.categories] ?? focusCategoryKey
    : null;

  const greeting = firstName
    ? fill(t.today.greeting, { name: firstName })
    : t.today.greetingFallback;
  const dayActions = actions.filter((item) => item.status === "todo" || item.status === "in_progress").slice(0, 5);

  const suggestions = [
    { id: "prospects", label: t.today.suggestionProspects, prompt: t.today.suggestionProspectsPrompt },
    { id: "plan", label: t.today.suggestionPlan, prompt: t.today.suggestionPlanPrompt },
    { id: "analyse", label: t.today.suggestionAnalyse, prompt: t.today.suggestionAnalysePrompt },
    { id: "landing", label: t.today.suggestionLanding, prompt: t.today.suggestionLandingPrompt },
  ];

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
    router.refresh();
  }

  function launchAction(action: SharpzAction) {
    const prompt = fill(t.today.launchPrompt, {
      title: action.title,
      why: action.why || t.common.none,
      how: action.howTo || t.common.none,
    });
    focusInput();
    void send(prompt);
  }

  const pulse =
    doneThisWeek > 0
      ? fill(t.today.pulseSummary, {
          done: doneThisWeek,
          open: openCount,
          focus: focusCategory ?? t.common.none,
        })
      : doneCount > 0
        ? fill(t.today.pulseWeekNone, { open: openCount })
        : null;

  return (
    <DashboardContent width="wide" className="space-y-20 md:space-y-24">
      <CopilotHero
        greeting={greeting}
        question={t.today.question}
        subtitle={t.today.heroSubtitle}
        suggestions={suggestions}
      />

      <section>
        <div className="mb-6 border-b border-white/[0.06] pb-4">
          <h2 className="text-[17px] font-semibold tracking-tight text-zg-fg">{t.today.planTitle}</h2>
          <p className="mt-1.5 text-sm text-zg-text-secondary">{t.today.planSubtitle}</p>
        </div>
        {dayActions.length ? (
          <ol className="divide-y divide-white/[0.06]">
            {dayActions.map((action, index) => (
              <li key={action.id} className="py-7 first:pt-1">
                <div className="flex items-start gap-5">
                  <span className="mt-0.5 w-5 shrink-0 text-[13px] tabular-nums text-zg-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="neutral">
                        {t.categories[action.category as keyof typeof t.categories] ?? action.category}
                      </Badge>
                      <Badge tone={action.status === "in_progress" ? "warning" : "neutral"}>
                        {t.statuses[action.status]}
                      </Badge>
                    </div>
                    <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight text-zg-fg">
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
                        <Sparkles className="h-3.5 w-3.5" />
                        {t.today.launchWithAssistant}
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
                        onClick={() => void updateStatus(action.id, "ignored")}
                      >
                        {t.actionsPage.markIgnored}
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <SharpzEmptyPanel title={t.empty.noActionsTitle} description={t.today.noPlan} icon={Target} />
        )}
      </section>

      {proposed.length ? (
        <section>
          <div className="mb-6 border-b border-white/[0.06] pb-4">
            <h2 className="text-[17px] font-semibold tracking-tight text-zg-fg">{t.today.proposedTitle}</h2>
            <p className="mt-1.5 text-sm text-zg-text-secondary">{t.today.proposedSubtitle}</p>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {proposed.map((item) => (
              <li key={item.localId} className="py-7 first:pt-1">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[17px] font-semibold tracking-tight text-zg-fg">{item.company}</h3>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block text-sm text-zg-text-muted underline-offset-4 hover:text-zg-fg hover:underline"
                      >
                        {item.url}
                      </a>
                    ) : null}
                  </div>
                  {item.fitScore != null ? (
                    <Badge tone="accent">
                      {t.prospectsPage.fitScore} {item.fitScore}/100
                    </Badge>
                  ) : null}
                </div>
                {item.whyFit ? <p className="mt-3 text-sm text-zg-text-secondary">{item.whyFit}</p> : null}
                {item.contact ? (
                  <p className="mt-2 text-sm text-zg-text-muted">
                    {t.prospectsPage.contact}: {item.contact}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={acceptingId === item.localId}
                    onClick={() => void acceptProspect(item.localId)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {t.today.validate}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => dismissProspect(item.localId)}>
                    <X className="h-3.5 w-3.5" />
                    {t.today.ignore}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <h2 className="text-[15px] font-semibold tracking-tight text-zg-fg">{t.today.attentionTitle}</h2>
          {signals.length ? (
            <ul className="mt-5 divide-y divide-white/[0.06]">
              {signals.map((signal) => (
                <li key={signal.id} className="first:pt-0">
                  <Link
                    href={signal.href}
                    className="-mx-2 block rounded-xl px-2 py-3.5 transition-colors hover:bg-white/[0.03]"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-zg-warning" strokeWidth={1.75} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-zg-fg">{signal.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-zg-text-secondary">{signal.detail}</p>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-sm text-zg-text-muted">{t.today.attentionEmpty}</p>
          )}
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <h2 className="text-[15px] font-semibold tracking-tight text-zg-fg">{t.today.pulseTitle}</h2>
          <p className={cn("mt-5 text-sm leading-relaxed", pulse ? "text-zg-text-secondary" : "text-zg-text-muted")}>
            {pulse ?? t.today.pulseEmpty}
          </p>
        </section>
      </div>
    </DashboardContent>
  );
}
