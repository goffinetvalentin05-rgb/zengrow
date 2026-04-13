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
import Button from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import type { SubscriptionPlan, SubscriptionStatus } from "@/src/lib/subscription";

type BillingPlansProps = {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  trialEndDate: string | null;
};

const PLAN_ITEMS = [
  {
    key: "starter" as const,
    title: "Starter",
    price: "49 CHF / mois",
    subtitle: "Pour bien démarrer",
    cta: "Choisir Starter",
    featured: false,
    features: [
      { label: "Réservations en ligne", icon: CalendarDays },
      { label: "Gestion des disponibilités", icon: Clock3 },
      { label: "Page de réservation personnalisable", icon: LayoutTemplate },
      { label: "Demandes d'avis Google automatiques", icon: Star },
      { label: "Feedback privé clients", icon: MessageSquare },
      { label: "Base clients", icon: Users },
    ],
  },
  {
    key: "pro" as const,
    title: "Pro",
    price: "69 CHF / mois",
    subtitle: "Pour accélérer",
    cta: "Choisir Pro",
    featured: true,
    features: [
      { label: "Tout le plan Starter", icon: BadgeCheck },
      { label: "Campagnes e-mail marketing", icon: Megaphone },
      { label: "Segmentation clients", icon: Sparkles },
      { label: "Stats clients", icon: BarChart2 },
      { label: "Export clients", icon: Gem },
    ],
  },
];

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

export default function BillingPlans({ status, plan, trialEndDate }: BillingPlansProps) {
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan>(null);
  const [message, setMessage] = useState<string | null>(null);
  const formattedTrialDate = formatDate(trialEndDate);
  const trialEndMs = trialEndDate ? new Date(trialEndDate).getTime() : null;
  const [now] = useState(() => Date.now());
  const totalTrialDays = 14;
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
              {status === "trial" ? "Votre essai gratuit est actif" : "Choisissez votre formule"}
            </CardTitle>
            <CardDescription className="!mt-2 max-w-2xl">
              {status === "trial" && formattedTrialDate
                ? `Fin de l'essai le ${formattedTrialDate}.`
                : "Un abonnement pour conserver toutes les fonctionnalités."}
            </CardDescription>
          </div>
          <div className="rounded-xl border border-zg-border/90 bg-zg-surface-elevated/85 px-5 py-4 text-left shadow-sm lg:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Plan actuel</p>
            <p className="mt-2 text-lg font-semibold text-zg-fg">{plan ?? "—"}</p>
            <p className="mt-1 text-xs text-zg-fg/52">Statut : {subscriptionStatusLabel(status)}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "trial" ? (
            <div className="max-w-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-zg-fg/85">Progression de l&apos;essai</span>
                <span className="font-semibold text-green-800">
                  {remainingDays !== null ? `${remainingDays} jour${remainingDays > 1 ? "s" : ""} restants` : "—"}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zg-border/75">
                <div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          ) : null}

          {status === "expired" ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950 shadow-sm">
              Votre essai est terminé. Choisissez un plan pour continuer à utiliser ZenGrow.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-zg-fg/52">Offres</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {PLAN_ITEMS.map((item) => (
            <div
              key={item.key}
              className={
                item.featured
                  ? "rounded-2xl border border-zg-border-accent bg-zg-highlight/65 p-8 shadow-zg-card backdrop-blur-sm ring-1 ring-zg-teal/12"
                  : "rounded-2xl border border-zg-border/90 bg-zg-surface/95 p-8 shadow-zg-soft backdrop-blur-sm"
              }
            >
              {item.featured ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-zg-teal">Recommandé</span>
              ) : null}
              <h3 className={item.featured ? "mt-2 text-xl font-semibold text-zg-fg" : "text-xl font-semibold text-zg-fg"}>
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-zg-fg/62">{item.subtitle}</p>
              <p className="mt-4 text-3xl font-bold tabular-nums tracking-tight text-zg-fg">{item.price}</p>
              <ul className="mt-6 space-y-2.5 text-sm text-zg-fg/85">
                {item.features.map((feature) => (
                  <FeatureItem key={`${item.key}-${feature.label}`} icon={feature.icon} label={feature.label} />
                ))}
              </ul>
              <Button type="button" className="mt-8 w-full" onClick={() => startCheckout(item.key)} disabled={Boolean(loadingPlan)}>
                {loadingPlan === item.key ? "Redirection…" : item.cta}
              </Button>
              <p className="mt-3 text-center text-xs text-zg-fg/52">Sans engagement long terme</p>
            </div>
          ))}
        </div>
      </div>

      {message ? (
        <p className="rounded-2xl border border-zg-border-strong bg-zg-surface/95 px-4 py-3 text-sm text-zg-fg/72 shadow-zg-soft backdrop-blur-sm">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function FeatureItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-zg-teal">
        <Check size={14} strokeWidth={2.5} />
      </span>
      <Icon size={15} className="shrink-0 text-zg-fg/45" strokeWidth={1.75} />
      <span>{label}</span>
    </li>
  );
}
