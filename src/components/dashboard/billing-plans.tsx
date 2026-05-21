"use client";

import { useState } from "react";
import {
  BadgeCheck,
  BarChart2,
  CalendarDays,
  Check,
  Clock3,
  Gem,
  LayoutTemplate,
  Megaphone,
  MessageSquare,
  Sparkles,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import Badge from "@/src/components/ui/badge";
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ZENGROW_PLAN_CATALOG, ZENGROW_TRIAL_DAYS } from "@/src/lib/billing/plan-catalog";
import type { SubscriptionPlan, SubscriptionStatus } from "@/src/lib/subscription";

type BillingPlansProps = {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  trialEndDate: string | null;
  /** Compte propriétaire / dev : pas de blocage d’essai, accès Pro effectif. */
  isOwnerDev?: boolean;
};

const PLAN_FEATURE_ICONS: Record<string, LucideIcon[]> = {
  starter: [CalendarDays, Clock3, LayoutTemplate, Star, MessageSquare, Users],
  pro: [BadgeCheck, Megaphone, Sparkles, BarChart2, Gem],
};

const PLAN_ITEMS = ZENGROW_PLAN_CATALOG.map((plan) => ({
  key: plan.key,
  title: plan.title,
  price: plan.priceLabel,
  subtitle: plan.subtitle,
  cta: plan.cta,
  featured: plan.featured,
  features: plan.features.map((label, i) => ({
    label,
    icon: PLAN_FEATURE_ICONS[plan.key][i] ?? BadgeCheck,
  })),
}));

function formatDate(value: string | null) {
  if (!value) return null;
  return new Intl.DateTimeFormat("fr-CH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function subscriptionStatusLabel(status: SubscriptionStatus): string {
  if (status === "trial") return "Essai gratuit";
  if (status === "active") return "Actif";
  if (status === "expired") return "Expiré";
  return status;
}

export default function BillingPlans({ status, plan, trialEndDate, isOwnerDev = false }: BillingPlansProps) {
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan>(null);
  const [message, setMessage] = useState<string | null>(null);
  const formattedTrialDate = formatDate(trialEndDate);
  const trialEndMs = trialEndDate ? new Date(trialEndDate).getTime() : null;
  const [now] = useState(() => Date.now());
  const totalTrialDays = ZENGROW_TRIAL_DAYS;
  const totalTrialMs = totalTrialDays * 24 * 60 * 60 * 1000;
  const trialStartMs = trialEndMs ? trialEndMs - totalTrialMs : null;
  const elapsedMs = trialStartMs ? now - trialStartMs : 0;
  const progressPercent = trialEndMs ? clamp((elapsedMs / totalTrialMs) * 100, 0, 100) : 0;
  const remainingDays = trialEndMs ? Math.max(0, Math.ceil((trialEndMs - now) / (24 * 60 * 60 * 1000))) : null;

  async function startCheckout(selectedPlan: "starter" | "pro") {
    setLoadingPlan(selectedPlan);
    setMessage(null);

    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selectedPlan }),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string; url?: string };
    if (!response.ok || !payload.url) {
      setMessage(payload.error ?? "Impossible de démarrer le paiement.");
      setLoadingPlan(null);
      return;
    }

    window.location.assign(payload.url);
  }

  return (
    <section className="space-y-10">
      <Card>
        <CardHeader className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-800">Facturation ZenGrow</p>
            <CardTitle className="!mt-0">
              {isOwnerDev
                ? "Facturation ZenGrow"
                : status === "trial"
                  ? "Votre essai gratuit est actif"
                  : "Choisissez votre formule"}
            </CardTitle>
            <CardDescription className="!mt-2 max-w-2xl">
              {isOwnerDev
                ? "Votre compte dispose d’un accès développeur : toutes les fonctionnalités Pro sont disponibles sans abonnement Stripe."
                : status === "trial" && formattedTrialDate
                  ? `Fin de l'essai le ${formattedTrialDate}.`
                  : "Un abonnement pour conserver toutes les fonctionnalités."}
            </CardDescription>
          </div>
          <div className="rounded-xl border border-zg-border bg-zg-surface-soft/80 px-5 py-4 text-left shadow-sm lg:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">Plan actuel</p>
            <p className="mt-2 text-lg font-semibold text-zg-fg">{plan ?? "—"}</p>
            <p className="mt-1 text-xs text-zg-muted">Statut : {subscriptionStatusLabel(status)}</p>
            {isOwnerDev ? (
              <Badge tone="success" className="mt-3">
                Accès développeur actif
              </Badge>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "trial" ? (
            <div className="max-w-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-zg-fg">Progression de l&apos;essai</span>
                <span className="font-semibold text-zg-success">
                  {remainingDays !== null ? `${remainingDays} jour${remainingDays > 1 ? "s" : ""} restants` : "—"}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zg-border">
                <div className="h-full rounded-full bg-zg-success transition-all duration-200 ease-out" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          ) : null}

          {status === "expired" && !isOwnerDev ? (
            <div className="rounded-xl border border-zg-warning/40 bg-zg-warning-soft-bg px-5 py-4 text-sm text-zg-warning">
              Votre essai est terminé. Choisissez un plan pour continuer à utiliser ZenGrow.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg-muted">Offres</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {PLAN_ITEMS.map((item) => (
            <div
              key={item.key}
              className={
                item.featured
                  ? "rounded-2xl border border-zg-border-accent bg-zg-surface-elevated p-8 ring-1 ring-zg-accent/25 transition-all duration-200 ease-out"
                  : "rounded-2xl border border-zg-border bg-zg-surface p-8 transition-all duration-200 ease-out hover:border-zg-border-hover"
              }
            >
              {item.featured ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-zg-accent">Recommandé</span>
              ) : null}
              <h3 className={item.featured ? "mt-2 text-xl font-semibold text-zg-fg" : "text-xl font-semibold text-zg-fg"}>
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-zg-muted">{item.subtitle}</p>
              <p className="mt-4 text-3xl font-bold tabular-nums tracking-tight text-zg-fg">{item.price}</p>
              <ul className="mt-6 space-y-2.5 text-sm text-zg-fg">
                {item.features.map((feature) => (
                  <FeatureItem key={`${item.key}-${feature.label}`} icon={feature.icon} label={feature.label} />
                ))}
              </ul>
              <Button type="button" className="mt-8 w-full" onClick={() => startCheckout(item.key)} disabled={Boolean(loadingPlan)}>
                {loadingPlan === item.key ? "Redirection…" : item.cta}
              </Button>
              <p className="mt-3 text-center text-xs text-zg-muted">Sans engagement long terme</p>
            </div>
          ))}
        </div>
      </div>

      {message ? (
        <p className="rounded-2xl border border-zg-border bg-zg-surface-elevated px-4 py-3 text-sm text-zg-text-secondary transition-all duration-200 ease-out">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function FeatureItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-zg-success">
        <Check size={14} strokeWidth={2.5} />
      </span>
      <Icon size={15} className="shrink-0 text-zg-fg-muted" strokeWidth={1.75} />
      <span>{label}</span>
    </li>
  );
}
