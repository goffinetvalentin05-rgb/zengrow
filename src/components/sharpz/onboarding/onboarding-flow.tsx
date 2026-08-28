"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { CHANNEL_KEYS, OBJECTIVE_KEYS, SAAS_STAGES } from "@/src/lib/sharpz/constants";
import type { ScanResult } from "@/src/lib/sharpz/types";
import { cn } from "@/src/lib/utils";
import {
  ChecklistRow,
  ChoiceButton,
  OnboardingProgress,
  OnboardingStepFrame,
} from "./onboarding-primitives";

type FlowStep =
  | "url"
  | "scanning"
  | "pricing"
  | "stage"
  | "primary"
  | "extra"
  | "channels"
  | "summary"
  | "generating";

type ScanCueId = "product" | "positioning" | "pricing" | "icp" | "market";
type CueState = "pending" | "found" | "missing";

const CUE_ORDER: ScanCueId[] = ["product", "positioning", "pricing", "icp", "market"];
const GEN_KEYS = ["genPositioning", "genOpportunities", "genActions", "genDashboard"] as const;

function hasIcp(scan: ScanResult | null) {
  const icp = scan?.detected.icp;
  if (!icp) return false;
  return Boolean(icp.clientType || icp.persona || icp.industry || icp.mainProblem);
}

function cueFound(id: ScanCueId, scan: ScanResult | null): boolean {
  if (!scan) return false;
  const d = scan.detected;
  if (id === "product") return Boolean(d.name);
  if (id === "positioning") return Boolean(d.description || d.category);
  if (id === "pricing") return Boolean(d.pricingSummary);
  if (id === "icp") return hasIcp(scan);
  return Boolean(d.market || d.country);
}

function formatProgress(template: string, current: number, total: number) {
  return template.replace("{current}", String(current)).replace("{total}", String(total));
}

export function OnboardingFlow() {
  const { t, locale } = useDashboardI18n();
  const router = useRouter();
  const [step, setStep] = useState<FlowStep>("url");
  const [url, setUrl] = useState("");
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pricing, setPricing] = useState("");
  const [stage, setStage] = useState("");
  const [primaryObjective, setPrimaryObjective] = useState("");
  const [extraObjectives, setExtraObjectives] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [visibleCues, setVisibleCues] = useState(1);
  const [cueStates, setCueStates] = useState<Record<ScanCueId, CueState>>({
    product: "pending",
    positioning: "pending",
    pricing: "pending",
    icp: "pending",
    market: "pending",
  });
  const [genDone, setGenDone] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const generatingLock = useRef(false);

  const needsPricing = !scan?.detected.pricingSummary;
  const saasLabel = scan?.detected.name || url.replace(/^https?:\/\//i, "").replace(/\/$/, "") || t.onboarding.summaryNone;

  const progressSteps = useMemo(() => {
    const items: FlowStep[] = ["url"];
    if (needsPricing) items.push("pricing");
    items.push("stage", "primary", "extra", "channels", "summary");
    return items;
  }, [needsPricing]);

  const progressIndex = progressSteps.indexOf(step);
  const showProgress = progressIndex >= 0;

  const cueCopy: Record<ScanCueId, string> = {
    product: t.onboarding.cueProduct,
    positioning: t.onboarding.cuePositioning,
    pricing: t.onboarding.cuePricing,
    icp: t.onboarding.cueIcp,
    market: t.onboarding.cueMarket,
  };

  useEffect(() => {
    if (step !== "generating" || error) return;
    setGenDone(0);
    const timers = GEN_KEYS.map((_, index) =>
      window.setTimeout(() => {
        setGenDone((current) => Math.max(current, index + 1));
      }, 700 * (index + 1)),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [step, error]);

  function goAfterScan(nextScan: ScanResult | null) {
    setScan(nextScan);
    setStep(nextScan?.detected.pricingSummary ? "stage" : "pricing");
  }

  async function scanSite(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const value = url.trim();
    if (!value) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStep("scanning");
    setVisibleCues(1);
    setCueStates({
      product: "pending",
      positioning: "pending",
      pricing: "pending",
      icp: "pending",
      market: "pending",
    });
    const reveal = window.setInterval(() => {
      setVisibleCues((current) => Math.min(CUE_ORDER.length, current + 1));
    }, 420);

    const timeout = window.setTimeout(() => controller.abort(), 35000);
    try {
      const response = await fetch("/api/sharpz/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; scan?: ScanResult };
      if (!response.ok || !data.scan) {
        setError(data.error ?? t.common.error);
        setStep("url");
        return;
      }
      const next = data.scan;
      setCueStates({
        product: cueFound("product", next) ? "found" : "missing",
        positioning: cueFound("positioning", next) ? "found" : "missing",
        pricing: cueFound("pricing", next) ? "found" : "missing",
        icp: cueFound("icp", next) ? "found" : "missing",
        market: cueFound("market", next) ? "found" : "missing",
      });
      setVisibleCues(CUE_ORDER.length);
      window.setTimeout(() => goAfterScan(next), 900);
    } catch (caught) {
      if (controller.signal.aborted) {
        setError(t.common.error);
      } else {
        setError(caught instanceof Error ? caught.message : t.common.error);
      }
      setStep("url");
    } finally {
      window.clearInterval(reveal);
      window.clearTimeout(timeout);
    }
  }

  function skipUrl() {
    setScan(null);
    setCueStates({
      product: "missing",
      positioning: "missing",
      pricing: "missing",
      icp: "missing",
      market: "missing",
    });
    setStep("pricing");
  }

  function goBack() {
    setError(null);
    if (step === "pricing") {
      setStep("url");
      return;
    }
    if (step === "stage") {
      setStep(needsPricing ? "pricing" : "url");
      return;
    }
    const order: FlowStep[] = ["stage", "primary", "extra", "channels", "summary"];
    const index = order.indexOf(step);
    if (index > 0) setStep(order[index - 1]);
  }

  async function generateRecommendations() {
    if (generatingLock.current) return;
    generatingLock.current = true;
    setError(null);
    setStep("generating");
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch("/api/sharpz/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim() || null,
          scan,
          pricingSummary: pricing.trim() || null,
          stage: stage || "mvp",
          primaryObjective: primaryObjective || "other",
          extraObjectives,
          channels,
          locale,
        }),
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? t.common.error);
        return;
      }
      setGenDone(GEN_KEYS.length);
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      router.push("/dashboard");
      router.refresh();
    } catch (caught) {
      if (controller.signal.aborted) {
        setError(t.common.error);
      } else {
        setError(caught instanceof Error ? caught.message : t.common.error);
      }
    } finally {
      generatingLock.current = false;
      window.clearTimeout(timeout);
    }
  }

  function toggle(list: string[], value: string, setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  const heading = (
    kicker: string,
    title: string,
    subtitle: string,
  ) => (
    <div className="mb-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zg-text-muted">{kicker}</p>
      <h1 className="mt-3 text-[1.85rem] font-semibold leading-tight tracking-tight text-zg-fg sm:text-[2.15rem]">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zg-text-secondary">{subtitle}</p>
    </div>
  );

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-xl flex-col justify-center px-5 py-12 sm:px-6">
      {showProgress ? (
        <OnboardingProgress
          current={progressIndex + 1}
          total={progressSteps.length}
          label={formatProgress(t.onboarding.progress, progressIndex + 1, progressSteps.length)}
        />
      ) : null}

      <OnboardingStepFrame stepKey={step}>
        {step === "url" ? (
          <form onSubmit={(event) => void scanSite(event)}>
            {heading(t.onboarding.kicker, t.onboarding.urlTitle, t.onboarding.urlSubtitle)}
            <Input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={t.onboarding.urlPlaceholder}
              inputMode="url"
              autoFocus
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 rounded-2xl bg-white/[0.04] px-4 text-base"
            />
            {error ? <p className="mt-3 text-sm text-zg-danger">{error}</p> : null}
            <Button type="submit" className="mt-8 w-full" size="lg" disabled={!url.trim()}>
              {t.onboarding.analyze}
            </Button>
            <button
              type="button"
              onClick={skipUrl}
              className="mt-4 w-full text-center text-sm text-zg-text-muted transition-colors hover:text-zg-fg"
            >
              {t.onboarding.skipUrl}
            </button>
          </form>
        ) : null}

        {step === "scanning" ? (
          <div>
            {heading(t.onboarding.kicker, t.onboarding.analyzingTitle, t.onboarding.analyzingSubtitle)}
            <div className="space-y-2.5">
              {CUE_ORDER.slice(0, Math.max(visibleCues, 1)).map((id) => (
                <ChecklistRow
                  key={id}
                  label={cueCopy[id]}
                  state={visibleCues > CUE_ORDER.indexOf(id) ? cueStates[id] : "pending"}
                  foundLabel={t.onboarding.cueFound}
                  missingLabel={t.onboarding.cueMissing}
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === "pricing" ? (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setStep("stage");
            }}
          >
            {heading(t.onboarding.kicker, t.onboarding.pricingQuestion, t.onboarding.pricingSubtitle)}
            <Input
              value={pricing}
              onChange={(event) => setPricing(event.target.value)}
              placeholder={t.onboarding.pricingPlaceholder}
              autoFocus
              className="h-12 rounded-2xl bg-white/[0.04] px-4 text-base"
            />
            <div className="mt-8 flex items-center gap-3">
              <button type="button" onClick={goBack} className="text-sm text-zg-text-muted hover:text-zg-fg">
                {t.onboarding.back}
              </button>
              <Button type="submit" className="flex-1" size="lg">
                {t.onboarding.continue}
              </Button>
            </div>
          </form>
        ) : null}

        {step === "stage" ? (
          <div>
            {heading(t.onboarding.kicker, t.onboarding.stageQuestion, t.onboarding.stageSubtitle)}
            <div className="grid gap-2.5">
              {SAAS_STAGES.map((item) => (
                <ChoiceButton key={item} active={stage === item} onClick={() => setStage(item)}>
                  {t.stages[item]}
                </ChoiceButton>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-3">
              <button type="button" onClick={goBack} className="text-sm text-zg-text-muted hover:text-zg-fg">
                {t.onboarding.back}
              </button>
              <Button type="button" className="flex-1" size="lg" disabled={!stage} onClick={() => setStep("primary")}>
                {t.onboarding.continue}
              </Button>
            </div>
          </div>
        ) : null}

        {step === "primary" ? (
          <div>
            {heading(t.onboarding.kicker, t.onboarding.objectiveQuestion, t.onboarding.objectiveSubtitle)}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {OBJECTIVE_KEYS.map((item) => (
                <ChoiceButton key={item} active={primaryObjective === item} onClick={() => setPrimaryObjective(item)}>
                  {t.objectives[item]}
                </ChoiceButton>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-3">
              <button type="button" onClick={goBack} className="text-sm text-zg-text-muted hover:text-zg-fg">
                {t.onboarding.back}
              </button>
              <Button
                type="button"
                className="flex-1"
                size="lg"
                disabled={!primaryObjective}
                onClick={() => setStep("extra")}
              >
                {t.onboarding.continue}
              </Button>
            </div>
          </div>
        ) : null}

        {step === "extra" ? (
          <div>
            {heading(t.onboarding.kicker, t.onboarding.extraQuestion, t.onboarding.extraSubtitle)}
            <div className="grid gap-2.5 sm:grid-cols-2">
              {OBJECTIVE_KEYS.filter((item) => item !== primaryObjective).map((item) => (
                <ChoiceButton
                  key={item}
                  active={extraObjectives.includes(item)}
                  onClick={() => toggle(extraObjectives, item, setExtraObjectives)}
                >
                  {t.objectives[item]}
                </ChoiceButton>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-3">
              <button type="button" onClick={goBack} className="text-sm text-zg-text-muted hover:text-zg-fg">
                {t.onboarding.back}
              </button>
              <Button type="button" variant="ghost" onClick={() => setStep("channels")}>
                {t.onboarding.skip}
              </Button>
              <Button type="button" className="flex-1" size="lg" onClick={() => setStep("channels")}>
                {t.onboarding.continue}
              </Button>
            </div>
          </div>
        ) : null}

        {step === "channels" ? (
          <div>
            {heading(t.onboarding.kicker, t.onboarding.channelsQuestion, t.onboarding.channelsSubtitle)}
            <div className="flex flex-wrap gap-2">
              {CHANNEL_KEYS.map((item) => {
                const active = channels.includes(item);
                return (
                  <ChoiceButton key={item} active={active} onClick={() => toggle(channels, item, setChannels)}>
                    {t.channels[item]}
                  </ChoiceButton>
                );
              })}
            </div>
            <div className="mt-8 flex items-center gap-3">
              <button type="button" onClick={goBack} className="text-sm text-zg-text-muted hover:text-zg-fg">
                {t.onboarding.back}
              </button>
              <Button type="button" className="flex-1" size="lg" onClick={() => setStep("summary")}>
                {t.onboarding.continue}
              </Button>
            </div>
          </div>
        ) : null}

        {step === "summary" ? (
          <div>
            {heading(t.onboarding.summaryKicker, t.onboarding.summaryTitle, t.onboarding.summarySubtitle)}
            <dl className="space-y-3 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              {[
                [t.onboarding.summarySaas, saasLabel],
                [t.onboarding.summaryStage, stage ? t.stages[stage as keyof typeof t.stages] : t.onboarding.summaryNone],
                [
                  t.onboarding.summaryObjective,
                  primaryObjective
                    ? t.objectives[primaryObjective as keyof typeof t.objectives]
                    : t.onboarding.summaryNone,
                ],
                [
                  t.onboarding.summaryChannels,
                  channels.length
                    ? channels.map((item) => t.channels[item as keyof typeof t.channels]).join(" · ")
                    : t.onboarding.summaryNone,
                ],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4">
                  <dt className="text-xs uppercase tracking-wider text-zg-text-muted">{label}</dt>
                  <dd className="text-right text-sm text-zg-fg">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex items-center gap-3">
              <button type="button" onClick={goBack} className="text-sm text-zg-text-muted hover:text-zg-fg">
                {t.onboarding.back}
              </button>
              <Button type="button" className="flex-1" size="lg" onClick={() => void generateRecommendations()}>
                {t.onboarding.prepare}
              </Button>
            </div>
          </div>
        ) : null}

        {step === "generating" ? (
          <div>
            {heading(t.onboarding.kicker, t.onboarding.generatingTitle, t.onboarding.analyzingSubtitle)}
            <div className="space-y-2.5">
              {GEN_KEYS.map((key, index) => {
                const done = genDone > index;
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-500",
                      done ? "border-white/12 bg-white/[0.04]" : "border-white/8 bg-white/[0.02] opacity-55",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full border",
                        done ? "border-zg-accent/40 bg-zg-accent/20 text-white" : "border-white/10",
                      )}
                    >
                      {done ? <Check className="h-3.5 w-3.5" strokeWidth={2.4} /> : null}
                    </span>
                    <span className="text-sm text-zg-fg">{t.onboarding[key]}</span>
                  </div>
                );
              })}
            </div>
            {error ? (
              <div className="mt-8 rounded-2xl border border-zg-danger/30 bg-zg-danger/10 p-4">
                <p className="text-sm font-medium text-zg-fg">{t.onboarding.errorTitle}</p>
                <p className="mt-1 text-sm text-zg-text-secondary">{error}</p>
                <Button type="button" className="mt-4" onClick={() => void generateRecommendations()}>
                  {t.onboarding.retry}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </OnboardingStepFrame>
    </div>
  );
}
