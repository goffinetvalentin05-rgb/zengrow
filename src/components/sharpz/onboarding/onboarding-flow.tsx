"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { Card, CardContent } from "@/src/components/ui/card";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import Badge from "@/src/components/ui/badge";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { CHANNEL_KEYS, OBJECTIVE_KEYS, SAAS_STAGES } from "@/src/lib/sharpz/constants";
import type { ScanResult } from "@/src/lib/sharpz/types";
import { cn } from "@/src/lib/utils";

type Step = "welcome" | "url" | "results" | "questions" | "generating";

export function OnboardingFlow() {
  const { t } = useDashboardI18n();
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [url, setUrl] = useState("");
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [pricing, setPricing] = useState("");
  const [stage, setStage] = useState("mvp");
  const [primaryObjective, setPrimaryObjective] = useState("more_prospects");
  const [extraObjectives, setExtraObjectives] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);

  const needsPricing = !scan?.detected.pricingSummary;

  const detectedRows = useMemo(() => {
    if (!scan) return [];
    const d = scan.detected;
    return [
      ["name", d.name],
      ["description", d.description],
      ["category", d.category],
      ["country", d.country],
      ["market", d.market],
      ["language", d.language],
      ["businessModel", d.businessModel],
      ["pricing", d.pricingSummary],
    ] as const;
  }, [scan]);

  async function scanSite(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const response = await fetch("/api/sharpz/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string; scan?: ScanResult };
    setPending(false);
    if (!response.ok || !data.scan) {
      setError(data.error ?? t.common.error);
      return;
    }
    setScan(data.scan);
    setStep("results");
  }

  function skipUrl() {
    setScan(null);
    setStep("questions");
  }

  async function finish() {
    setError(null);
    setPending(true);
    setStep("generating");
    const response = await fetch("/api/sharpz/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: url.trim() || null,
        scan,
        pricingSummary: pricing.trim() || null,
        stage,
        primaryObjective,
        extraObjectives,
        channels,
      }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error ?? t.common.error);
      setStep("questions");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  function toggle(list: string[], value: string, setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  return (
    <DashboardContent>
      <PageHeader kicker={t.onboarding.kicker} title={t.onboarding.welcomeTitle} subtitle={t.onboarding.welcomeSubtitle} />

      {step === "welcome" ? (
        <Card className="p-8">
          <CardContent className="space-y-6">
            <p className="text-sm leading-relaxed text-zg-text-secondary">{t.onboarding.stepASubtitle}</p>
            <Button type="button" onClick={() => setStep("url")}>
              {t.onboarding.start}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {step === "url" ? (
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-zg-fg">{t.onboarding.stepATitle}</h2>
          <p className="mt-2 text-sm text-zg-text-secondary">{t.onboarding.stepASubtitle}</p>
          <form className="mt-6 space-y-4" onSubmit={scanSite}>
            <Input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={t.onboarding.urlPlaceholder}
              required
            />
            {error ? <p className="text-sm text-zg-danger">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? t.onboarding.scanning : t.onboarding.scan}
              </Button>
              <Button type="button" variant="ghost" onClick={skipUrl}>
                {t.onboarding.skipUrl}
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {step === "results" && scan ? (
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-zg-fg">{t.onboarding.scanResults}</h2>
          <ul className="mt-5 space-y-3">
            {detectedRows.map(([key, value]) => (
              <li key={key} className="flex items-start justify-between gap-4 rounded-xl border border-zg-border p-3">
                <span className="text-sm text-zg-text-muted">{key}</span>
                {value ? (
                  <span className="text-right text-sm text-zg-fg">{value}</span>
                ) : (
                  <Badge tone="neutral">{t.onboarding.unknown}</Badge>
                )}
              </li>
            ))}
          </ul>
          <Button type="button" className="mt-6" onClick={() => setStep("questions")}>
            {t.onboarding.continue}
          </Button>
        </Card>
      ) : null}

      {step === "questions" || step === "generating" ? (
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-zg-fg">{t.onboarding.stepBTitle}</h2>
          <p className="mt-2 text-sm text-zg-text-secondary">{t.onboarding.stepBSubtitle}</p>
          <div className="mt-6 space-y-6">
            {needsPricing ? (
              <label className="block space-y-1.5 text-sm">
                <span className="text-zg-text-muted">{t.onboarding.pricingQuestion}</span>
                <Textarea
                  rows={2}
                  value={pricing}
                  onChange={(event) => setPricing(event.target.value)}
                  placeholder={t.onboarding.pricingPlaceholder}
                />
              </label>
            ) : null}

            <fieldset>
              <legend className="mb-2 text-sm text-zg-text-muted">{t.onboarding.stageQuestion}</legend>
              <div className="flex flex-wrap gap-2">
                {SAAS_STAGES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStage(item)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium",
                      stage === item
                        ? "border-zg-accent bg-zg-accent-soft-bg text-zg-accent"
                        : "border-zg-border text-zg-text-muted hover:bg-zg-card-hover",
                    )}
                  >
                    {t.stages[item]}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm text-zg-text-muted">{t.onboarding.objectiveQuestion}</legend>
              <div className="flex flex-wrap gap-2">
                {OBJECTIVE_KEYS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPrimaryObjective(item)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium",
                      primaryObjective === item
                        ? "border-zg-accent bg-zg-accent-soft-bg text-zg-accent"
                        : "border-zg-border text-zg-text-muted hover:bg-zg-card-hover",
                    )}
                  >
                    {t.objectives[item]}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm text-zg-text-muted">{t.onboarding.extraObjectivesQuestion}</legend>
              <div className="flex flex-wrap gap-2">
                {OBJECTIVE_KEYS.filter((item) => item !== primaryObjective).map((item) => {
                  const active = extraObjectives.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggle(extraObjectives, item, setExtraObjectives)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        active
                          ? "border-zg-accent bg-zg-accent-soft-bg text-zg-accent"
                          : "border-zg-border text-zg-text-muted hover:bg-zg-card-hover",
                      )}
                    >
                      {t.objectives[item]}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm text-zg-text-muted">{t.onboarding.channelsQuestion}</legend>
              <div className="flex flex-wrap gap-2">
                {CHANNEL_KEYS.map((item) => {
                  const active = channels.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggle(channels, item, setChannels)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-medium",
                        active
                          ? "border-zg-accent bg-zg-accent-soft-bg text-zg-accent"
                          : "border-zg-border text-zg-text-muted hover:bg-zg-card-hover",
                      )}
                    >
                      {t.channels[item]}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {error ? <p className="text-sm text-zg-danger">{error}</p> : null}
            <Button type="button" disabled={pending} onClick={() => void finish()}>
              {pending ? t.onboarding.generating : t.onboarding.finish}
            </Button>
          </div>
        </Card>
      ) : null}
    </DashboardContent>
  );
}
