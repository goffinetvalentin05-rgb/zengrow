"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import Textarea from "@/src/components/ui/textarea";
import Select from "@/src/components/ui/select";
import Badge from "@/src/components/ui/badge";
import BillingPlans from "@/src/components/dashboard/billing-plans";
import { AnalyticsSnippetPanel } from "@/src/components/sharpz/analytics/analytics-snippet-panel";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { CHANNEL_KEYS, OBJECTIVE_KEYS, SAAS_STAGES } from "@/src/lib/sharpz/constants";
import { cn } from "@/src/lib/utils";
import type {
  AcquisitionChannel,
  Integration,
  UserObjective,
  UserSaas,
} from "@/src/lib/sharpz/types";
import type { SubscriptionPlan, SubscriptionStatus } from "@/src/lib/subscription";

const TABS = ["saas", "objectives", "integrations", "account"] as const;
type TabId = (typeof TABS)[number];

type Props = {
  saas: UserSaas | null;
  objectives: UserObjective[];
  channels: AcquisitionChannel[];
  integrations: Integration[];
  userEmail: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan;
  trialEndDate: string | null;
  isOwnerDev?: boolean;
  analyticsSnippet: string;
  analyticsHasData: boolean;
  analyticsLastEventAt: string | null;
};

export function SettingsView({
  saas,
  objectives,
  channels,
  integrations,
  userEmail,
  subscriptionStatus,
  subscriptionPlan,
  trialEndDate,
  isOwnerDev,
  analyticsSnippet,
  analyticsHasData,
  analyticsLastEventAt,
}: Props) {
  const { t } = useDashboardI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const showToast = useDashboardToast();
  const initialTab = (searchParams.get("section") as TabId) || "saas";
  const [tab, setTab] = useState<TabId>(TABS.includes(initialTab) ? initialTab : "saas");
  const [pending, setPending] = useState(false);

  const [name, setName] = useState(saas?.name ?? "");
  const [url, setUrl] = useState(saas?.url ?? "");
  const [description, setDescription] = useState(saas?.description ?? "");
  const [market, setMarket] = useState(saas?.market ?? "");
  const [businessModel, setBusinessModel] = useState(saas?.businessModel ?? "");
  const [pricing, setPricing] = useState(saas?.pricingSummary ?? "");
  const [stage, setStage] = useState<string>(saas?.stage ?? "mvp");
  const [clientType, setClientType] = useState(saas?.icp.clientType ?? "");
  const [companySize, setCompanySize] = useState(saas?.icp.companySize ?? "");
  const [industry, setIndustry] = useState(saas?.icp.industry ?? "");
  const [location, setLocation] = useState(saas?.icp.location ?? "");
  const [persona, setPersona] = useState(saas?.icp.persona ?? "");
  const [mainProblem, setMainProblem] = useState(saas?.icp.mainProblem ?? "");

  const primary = objectives.find((item) => item.isPrimary)?.key ?? "more_prospects";
  const [primaryObjective, setPrimaryObjective] = useState(primary);
  const [extraObjectives, setExtraObjectives] = useState<string[]>(
    objectives.filter((item) => !item.isPrimary).map((item) => item.key),
  );
  const [selectedChannels, setSelectedChannels] = useState<string[]>(channels.map((item) => item.channel));

  const labels: Record<TabId, string> = {
    saas: t.settingsPage.saas,
    objectives: t.settingsPage.objectives,
    integrations: t.settingsPage.integrations,
    account: t.settingsPage.account,
  };

  const integrationByProvider = useMemo(
    () => Object.fromEntries(integrations.map((item) => [item.provider, item])),
    [integrations],
  );

  async function saveSaas(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/sharpz/saas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        url,
        description,
        market,
        businessModel: businessModel || null,
        pricingSummary: pricing,
        stage,
        icp: {
          clientType: clientType || null,
          companySize: companySize || null,
          industry: industry || null,
          location: location || null,
          persona: persona || null,
          mainProblem: mainProblem || null,
        },
      }),
    });
    setPending(false);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    showToast({ message: t.common.saved });
    router.refresh();
  }

  async function saveObjectives(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/sharpz/objectives", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primaryObjective,
        extraObjectives,
        channels: selectedChannels,
      }),
    });
    setPending(false);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    showToast({ message: t.common.saved });
    router.refresh();
  }

  function toggle(list: string[], value: string, setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  return (
    <DashboardContent>
      <PageHeader title={t.settingsPage.title} subtitle={t.settingsPage.subtitle} />

      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="inline-flex min-w-full gap-1 rounded-xl border border-zg-border bg-zg-surface-elevated/80 p-1 backdrop-blur-sm sm:min-w-0">
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 ease-out",
                tab === id
                  ? "bg-white text-zinc-950"
                  : "text-zg-text-muted hover:bg-white/5 hover:text-zg-fg",
              )}
            >
              {labels[id]}
            </button>
          ))}
        </div>
      </div>

      {tab === "saas" ? (
        <Card>
          <CardHeader>
            <CardTitle>{t.settingsPage.saas}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={saveSaas}>
              <label className="space-y-1.5 text-sm">
                <span className="text-zg-text-muted">{t.settingsPage.name}</span>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-zg-text-muted">{t.settingsPage.url}</span>
                <Input value={url} onChange={(event) => setUrl(event.target.value)} />
              </label>
              <label className="space-y-1.5 text-sm md:col-span-2">
                <span className="text-zg-text-muted">{t.settingsPage.description}</span>
                <Textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-zg-text-muted">{t.settingsPage.market}</span>
                <Input value={market} onChange={(event) => setMarket(event.target.value)} />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-zg-text-muted">{t.settingsPage.businessModel}</span>
                <Select value={businessModel} onChange={(event) => setBusinessModel(event.target.value)}>
                  <option value="">{t.common.unknown}</option>
                  <option value="b2b">{t.settingsPage.b2b}</option>
                  <option value="b2c">{t.settingsPage.b2c}</option>
                  <option value="both">{t.settingsPage.both}</option>
                </Select>
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-zg-text-muted">{t.settingsPage.pricing}</span>
                <Input value={pricing} onChange={(event) => setPricing(event.target.value)} />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-zg-text-muted">{t.settingsPage.stage}</span>
                <Select value={stage} onChange={(event) => setStage(event.target.value)}>
                  {SAAS_STAGES.map((item) => (
                    <option key={item} value={item}>
                      {t.stages[item]}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-zg-text-muted">{t.settingsPage.clientType}</span>
                <Input value={clientType} onChange={(event) => setClientType(event.target.value)} />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-zg-text-muted">{t.settingsPage.companySize}</span>
                <Input value={companySize} onChange={(event) => setCompanySize(event.target.value)} />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-zg-text-muted">{t.settingsPage.industry}</span>
                <Input value={industry} onChange={(event) => setIndustry(event.target.value)} />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-zg-text-muted">{t.settingsPage.location}</span>
                <Input value={location} onChange={(event) => setLocation(event.target.value)} />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="text-zg-text-muted">{t.settingsPage.persona}</span>
                <Input value={persona} onChange={(event) => setPersona(event.target.value)} />
              </label>
              <label className="space-y-1.5 text-sm md:col-span-2">
                <span className="text-zg-text-muted">{t.settingsPage.mainProblem}</span>
                <Textarea rows={2} value={mainProblem} onChange={(event) => setMainProblem(event.target.value)} />
              </label>
              <div className="md:col-span-2">
                <Button type="submit" disabled={pending}>
                  {t.common.save}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {tab === "objectives" ? (
        <Card>
          <CardHeader>
            <CardTitle>{t.settingsPage.objectives}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={saveObjectives}>
              <label className="block space-y-1.5 text-sm">
                <span className="text-zg-text-muted">{t.settingsPage.primaryObjective}</span>
                <Select value={primaryObjective} onChange={(event) => setPrimaryObjective(event.target.value)}>
                  {OBJECTIVE_KEYS.map((item) => (
                    <option key={item} value={item}>
                      {t.objectives[item]}
                    </option>
                  ))}
                </Select>
              </label>
              <fieldset>
                <legend className="mb-2 text-sm text-zg-text-muted">{t.settingsPage.extraObjectives}</legend>
                <div className="flex flex-wrap gap-2">
                  {OBJECTIVE_KEYS.filter((item) => item !== primaryObjective).map((item) => {
                    const active = extraObjectives.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggle(extraObjectives, item, setExtraObjectives)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
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
                <legend className="mb-2 text-sm text-zg-text-muted">{t.settingsPage.channels}</legend>
                <div className="flex flex-wrap gap-2">
                  {CHANNEL_KEYS.map((item) => {
                    const active = selectedChannels.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggle(selectedChannels, item, setSelectedChannels)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
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
              <Button type="submit" disabled={pending}>
                {t.common.save}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {tab === "integrations" ? (
        <div className="space-y-4">
          <AnalyticsSnippetPanel
            snippet={analyticsSnippet}
            hasData={analyticsHasData}
            lastEventAt={analyticsLastEventAt}
          />
          <div className="grid gap-4 md:grid-cols-2">
          {(["sharpz_analytics", "stripe", "paddle", "google_analytics", "posthog", "supabase", "search_console"] as const).map(
            (provider) => {
              const row = integrationByProvider[provider];
              const status = (row?.status as "connected" | "available" | "coming_soon") ?? (provider === "sharpz_analytics" ? "available" : "coming_soon");
              return (
                <Card key={provider} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-zg-fg">{t.integrations[provider]}</h3>
                      <p className="mt-1 text-sm text-zg-text-muted">
                        {provider === "sharpz_analytics" && status === "connected"
                          ? t.settingsPage.analyticsActive
                          : t.settingsPage.notConnected}
                      </p>
                    </div>
                    <Badge tone={status === "connected" ? "success" : status === "available" ? "accent" : "neutral"}>
                      {status === "connected"
                        ? t.common.connected
                        : status === "available"
                          ? t.common.available
                          : t.common.comingSoon}
                    </Badge>
                  </div>
                  {provider === "sharpz_analytics" ? null : (
                    <Button type="button" size="sm" className="mt-4" variant="secondary" disabled>
                      {t.settingsPage.connect}
                    </Button>
                  )}
                </Card>
              );
            },
          )}
          </div>
        </div>
      ) : null}

      {tab === "account" ? (
        <div className="space-y-6">
          <Card className="p-5">
            <p className="text-sm text-zg-text-muted">{t.settingsPage.accountEmail}</p>
            <p className="mt-1 text-base font-medium text-zg-fg">{userEmail}</p>
          </Card>
          <div>
            <h2 className="mb-4 text-base font-semibold text-zg-fg">{t.settingsPage.billing}</h2>
            <BillingPlans
              status={subscriptionStatus}
              plan={subscriptionPlan}
              trialEndDate={trialEndDate}
              isOwnerDev={isOwnerDev}
            />
          </div>
        </div>
      ) : null}
    </DashboardContent>
  );
}
