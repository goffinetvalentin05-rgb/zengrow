"use client";

import { useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Check,
  Clock3,
  Gem,
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
    price: "35 CHF / mois",
    subtitle: "Pour bien démarrer",
    cta: "Choisir Starter",
    featured: false,
    features: [
      { label: "Réservations", icon: CalendarDays },
      { label: "Disponibilités", icon: Clock3 },
      { label: "Demandes d'avis Google", icon: Star },
      { label: "Feedback privé", icon: MessageSquare },
      { label: "Base clients", icon: Users },
    ],
  },
  {
    key: "pro" as const,
    title: "Pro",
    price: "49 CHF / mois",
    subtitle: "Pour accélérer",
    cta: "Choisir Pro",
    featured: true,
    features: [
      { label: "Tout Starter", icon: BadgeCheck },
      { label: "Campagnes e-mail", icon: Megaphone },
      { label: "Segmentation clients", icon: Sparkles },
      { label: "Stats clients", icon: Star },
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

export default function BillingPlans({ status, plan, trialEndDate }: BillingPlansProps) {
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan>(null);
  const [message, setMessage] = useState<string | null>(null);
  const formattedTrialDate = formatDate(trialEndDate);
  const trialEndMs = trialEndDate ? new Date(trialEndDate).getTime() : null;
  const now = Date.now();
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
          <div className="rounded-xl border border-gray-100 bg-gray-50/80 px-5 py-4 text-left shadow-sm lg:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Plan actuel</p>
            <p className="mt-2 text-lg font-semibold text-gray-900">{plan ?? "—"}</p>
            <p className="mt-1 text-xs text-gray-500">Statut : {status}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "trial" ? (
            <div className="max-w-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-800">Progression de l&apos;essai</span>
                <span className="font-semibold text-green-800">
                  {remainingDays !== null ? `${remainingDays} jour${remainingDays > 1 ? "s" : ""} restants` : "—"}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200/80">
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
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Offres</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {PLAN_ITEMS.map((item) => (
            <div
              key={item.key}
              className={
                item.featured
                  ? "rounded-xl border border-green-200 bg-green-50/50 p-8 shadow-sm"
                  : "rounded-xl border border-gray-100 bg-white p-8 shadow-sm"
              }
            >
              {item.featured ? (
                <span className="text-xs font-semibold uppercase tracking-wide text-green-800">Recommandé</span>
              ) : null}
              <h3 className={item.featured ? "mt-2 text-xl font-semibold text-gray-900" : "text-xl font-semibold text-gray-900"}>
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{item.subtitle}</p>
              <p className="mt-4 text-3xl font-bold tabular-nums tracking-tight text-gray-900">{item.price}</p>
              <ul className="mt-6 space-y-2.5 text-sm text-gray-800">
                {item.features.map((feature) => (
                  <FeatureItem key={`${item.key}-${feature.label}`} icon={feature.icon} label={feature.label} />
                ))}
              </ul>
              <Button type="button" className="mt-8 w-full" onClick={() => startCheckout(item.key)} disabled={Boolean(loadingPlan)}>
                {loadingPlan === item.key ? "Redirection…" : item.cta}
              </Button>
              <p className="mt-3 text-center text-xs text-gray-500">Sans engagement long terme</p>
            </div>
          ))}
        </div>
      </div>

      {message ? (
        <p className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">{message}</p>
      ) : null}
    </section>
  );
}

function FeatureItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-green-700">
        <Check size={14} strokeWidth={2.5} />
      </span>
      <Icon size={15} className="shrink-0 text-gray-400" strokeWidth={1.75} />
      <span>{label}</span>
    </li>
  );
}
