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
    subtitle: "Tout ce qu'il faut pour bien demarrer",
    cta: "Prendre Starter",
    featured: false,
    features: [
      { label: "Reservations", icon: CalendarDays },
      { label: "Gestion des disponibilites", icon: Clock3 },
      { label: "Demandes d'avis Google", icon: Star },
      { label: "Feedback prive", icon: MessageSquare },
      { label: "Base clients", icon: Users },
    ],
  },
  {
    key: "pro" as const,
    title: "Pro",
    price: "49 CHF / mois",
    subtitle: "Le plan ideal pour accelerer votre croissance",
    cta: "Prendre Pro",
    featured: true,
    features: [
      { label: "Tout Starter", icon: BadgeCheck },
      { label: "Campagnes marketing email", icon: Megaphone },
      { label: "Segmentation clients", icon: Sparkles },
      { label: "Statistiques clients", icon: Star },
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
      setMessage(payload.error ?? "Impossible de demarrer le paiement.");
      setLoadingPlan(null);
      return;
    }

    window.location.assign(payload.url);
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface)] shadow-sm">
        <div className="space-y-6 border-b border-[rgba(0,0,0,0.06)] px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-[rgba(13,92,74,0.2)] bg-[rgba(13,92,74,0.06)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)]">
                <Sparkles size={14} />
                Facturation ZenGrow
              </p>
              <h2 className="dashboard-page-title max-w-xl md:text-2xl">
                {status === "trial" ? "Votre essai gratuit est actif" : "Choisissez le plan adapte a votre restaurant"}
              </h2>
              <p className="max-w-2xl text-sm text-[var(--muted-foreground)] md:text-[15px] md:leading-relaxed">
                {status === "trial" && formattedTrialDate
                  ? `Votre essai se termine le ${formattedTrialDate}.`
                  : "Activez un abonnement pour continuer a utiliser toutes les fonctionnalites ZenGrow."}
              </p>
            </div>

            <div className="rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface-muted)]/50 px-5 py-4 text-right shadow-sm">
              <p className="dashboard-section-kicker">Plan actuel</p>
              <p className="mt-2 text-lg font-semibold text-[var(--foreground)]">{plan ?? "Aucun"}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">Statut: {status}</p>
            </div>
          </div>

          {status === "trial" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-[var(--foreground)]">Progression de l&apos;essai</p>
                <p className="font-semibold text-[var(--primary)]">
                  {remainingDays !== null ? `${remainingDays} jour${remainingDays > 1 ? "s" : ""} restants` : "--"}
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[rgba(0,0,0,0.06)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}

          {status === "expired" ? (
            <div className="rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-900">
              Votre essai est termine. Choisissez un plan pour redebloquer immediatement votre espace ZenGrow.
            </div>
          ) : null}
        </div>

        <div className="space-y-5 px-6 py-6 md:px-8 md:py-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="dashboard-section-kicker">Plans d&apos;abonnement</p>
            <p className="text-xs text-[var(--muted-foreground)]">35 CHF ou 49 CHF par mois</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {PLAN_ITEMS.map((item) => (
              <div
                key={item.key}
                className={[
                  "relative rounded-xl border px-6 py-6 shadow-sm transition-colors",
                  item.featured
                    ? "border-[rgba(13,92,74,0.28)] bg-[rgba(13,92,74,0.04)]"
                    : "border-[rgba(0,0,0,0.07)] bg-[var(--surface-muted)]/30",
                ].join(" ")}
              >
                {item.featured ? (
                  <span className="absolute right-4 top-4 rounded-full bg-[var(--primary)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Populaire
                  </span>
                ) : null}

                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-[var(--foreground)]">{item.title}</h3>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">{item.subtitle}</p>
                    <p className="mt-4 text-3xl font-semibold tracking-tight text-[var(--foreground)]">{item.price}</p>
                  </div>

                  <ul className="space-y-2.5 text-sm text-[var(--foreground)]/85">
                    {item.features.map((feature) => (
                      <FeatureItem key={`${item.key}-${feature.label}`} icon={feature.icon} label={feature.label} />
                    ))}
                  </ul>

                  <Button
                    type="button"
                    onClick={() => startCheckout(item.key)}
                    disabled={Boolean(loadingPlan)}
                    className={item.featured ? "w-full" : "w-full"}
                  >
                    {loadingPlan === item.key ? "Redirection..." : item.cta}
                  </Button>

                  <p className="text-center text-xs text-[var(--muted-foreground)]">Sans engagement long terme</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {message ? (
        <p className="rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)]/85 shadow-sm">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function FeatureItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(13,92,74,0.1)] text-[var(--primary)]">
        <Check size={14} strokeWidth={2.5} />
      </span>
      <span className="inline-flex items-center gap-2">
        <Icon size={15} className="text-[var(--primary)]/80" />
        <span>{label}</span>
      </span>
    </li>
  );
}
