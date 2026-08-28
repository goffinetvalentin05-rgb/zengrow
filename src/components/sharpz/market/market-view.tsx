"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Globe2, RefreshCw } from "lucide-react";
import PageHeader from "@/src/components/dashboard/page-header";
import DashboardContent from "@/src/components/dashboard/ui/dashboard-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import { SharpzEmptyPanel } from "@/src/components/sharpz/empty-panel";
import { useDashboardI18n } from "@/src/components/dashboard/i18n/dashboard-locale-provider";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import type { Competitor, CompetitorChange } from "@/src/lib/sharpz/types";

type Props = {
  competitors: Competitor[];
  changes: CompetitorChange[];
  embedded?: boolean;
};

function changeLabel(type: string) {
  switch (type) {
    case "pricing_changed":
      return "Pricing";
    case "plan_added":
      return "Plan +";
    case "plan_removed":
      return "Plan −";
    case "hero_changed":
      return "Hero";
    case "cta_changed":
      return "CTA";
    case "positioning_changed":
      return "Positionnement";
    case "page_unavailable":
      return "Inaccessible";
    default:
      return type;
  }
}

export function MarketView({ competitors, changes, embedded = false }: Props) {
  const { t, locale } = useDashboardI18n();
  const router = useRouter();
  const showToast = useDashboardToast();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const dateLocale = locale === "en" ? "en-GB" : "fr-FR";

  const latestByCompetitor = useMemo(() => {
    const map = new Map<string, CompetitorChange>();
    for (const change of changes) {
      if (!change.competitorId) continue;
      if (!map.has(change.competitorId)) map.set(change.competitorId, change);
    }
    return map;
  }, [changes]);

  async function addCompetitor(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/sharpz/competitors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || undefined, url }),
    });
    setPending(false);
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      showToast({ message: data.error ?? t.common.error });
      return;
    }
    setName("");
    setUrl("");
    showToast({ message: t.common.saved });
    router.refresh();
  }

  async function checkNow(id: string) {
    setCheckingId(id);
    const response = await fetch(`/api/sharpz/competitors/${id}/check`, { method: "POST" });
    setCheckingId(null);
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
    const data = (await response.json()) as { ok?: boolean; errorMessage?: string | null; changesCreated?: number };
    if (!data.ok && data.errorMessage) {
      showToast({ message: data.errorMessage });
    } else {
      showToast({
        message:
          data.changesCreated && data.changesCreated > 0
            ? `${data.changesCreated} changement(s) détecté(s)`
            : "Vérification terminée",
      });
    }
    router.refresh();
  }

  async function setActive(id: string, active: boolean) {
    const response = await fetch(`/api/sharpz/competitors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (!response.ok) {
      showToast({ message: t.common.error });
      return;
    }
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
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder={t.marketPage.competitorUrl}
              required
            />
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={`${t.marketPage.competitorName} (optionnel)`}
            />
            <Button type="submit" size="sm" disabled={pending || !url.trim()}>
              {t.marketPage.addCompetitor}
            </Button>
          </form>

          {competitors.length ? (
            <ul className="space-y-3">
              {competitors.map((item) => {
                const latest = latestByCompetitor.get(item.id);
                return (
                  <li
                    key={item.id}
                    className="rounded-xl border border-zg-border px-4 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-zg-fg">{item.name}</p>
                          <Badge tone={item.active ? "success" : "neutral"}>
                            {item.active ? (item.status === "check_failed" ? "Erreur check" : "Actif") : "Pause"}
                          </Badge>
                        </div>
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-zg-text-secondary hover:underline"
                          >
                            {item.url.replace(/^https?:\/\//, "")}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <p className="mt-1 text-xs text-zg-muted">URL manquante</p>
                        )}
                        <p className="mt-2 text-xs text-zg-muted">
                          Dernière vérif.{" "}
                          {item.lastCheckedAt
                            ? new Date(item.lastCheckedAt).toLocaleString(dateLocale)
                            : "jamais"}
                          {latest ? ` · Dernier changement : ${changeLabel(latest.changeType)}` : ""}
                        </p>
                        {item.pricing ? (
                          <p className="mt-1 text-sm text-zg-text-secondary">{item.pricing}</p>
                        ) : (
                          <p className="mt-1 text-sm text-zg-muted">Pricing : donnée non disponible</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.url ? (
                          <a
                            href={item.pricingUrl || item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex"
                          >
                            <Button type="button" size="sm" variant="secondary">
                              Voir source
                            </Button>
                          </a>
                        ) : null}
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={checkingId === item.id || !item.url}
                          onClick={() => void checkNow(item.id)}
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Vérifier
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => void setActive(item.id, !item.active)}
                        >
                          {item.active ? "Désactiver" : "Réactiver"}
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <SharpzEmptyPanel
              title={t.empty.noCompetitorsTitle}
              description="Ajoute une URL publique pour démarrer la veille. Aucun concurrent inventé."
              icon={Globe2}
              className="min-h-[180px]"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.marketPage.changes}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {changes.length ? (
            changes.slice(0, 30).map((item) => (
              <div key={item.id} className="rounded-xl border border-zg-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={item.importance === "high" ? "danger" : "warning"}>
                    {changeLabel(item.changeType)}
                  </Badge>
                  {item.competitorName ? (
                    <span className="text-xs font-medium text-zg-fg">{item.competitorName}</span>
                  ) : null}
                  <span className="text-xs text-zg-text-muted">
                    {new Date(item.createdAt).toLocaleDateString(dateLocale)}
                  </span>
                  {item.confidence ? (
                    <span className="text-[10px] uppercase tracking-wide text-zg-muted">{item.confidence}</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-medium text-zg-fg">{item.whatChanged}</p>
                {item.whyItMatters ? (
                  <p className="mt-1 text-sm text-zg-text-secondary">{item.whyItMatters}</p>
                ) : null}
                {item.sourceUrl ? (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-zg-accent hover:underline"
                  >
                    Voir source <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-zg-text-muted">
              Aucun changement détecté pour l’instant. Les vérifications quotidiennes alimentent cette timeline.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );

  if (embedded) return <div className="space-y-8">{inner}</div>;
  return <DashboardContent>{inner}</DashboardContent>;
}
