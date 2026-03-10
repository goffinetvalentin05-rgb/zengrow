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
    <section className="space-y-8 md:space-y-10">
      <Card className="overflow-hidden rounded-[28px] border-[#D6ECE6] bg-gradient-to-br from-[#F7FCFA] via-white to-[#F2FBF8] shadow-[0_28px_70px_-42px_rgba(15,63,58,0.55)]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#CBE6DF] bg-white px-3 py-1 text-xs font-semibold tracking-[0.08em] text-[#1F7A6C]">
                <Sparkles size={14} />
                Facturation ZenGrow
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#0F3F3A]">
                {status === "trial" ? "Votre essai gratuit est actif" : "Choisissez le plan adapte a votre restaurant"}
              </h2>
              <p className="max-w-2xl text-sm text-[#0F3F3A]/70 md:text-base">
                {status === "trial" && formattedTrialDate
                  ? `Votre essai se termine le ${formattedTrialDate}.`
                  : "Activez un abonnement pour continuer a utiliser toutes les fonctionnalites ZenGrow."}
              </p>
            </div>

            <div className="rounded-2xl border border-[#DCEEE9] bg-white px-4 py-3 text-right shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0F3F3A]/50">Plan actuel</p>
              <p className="mt-1 text-lg font-semibold text-[#0F3F3A]">{plan ?? "Aucun"}</p>
              <p className="mt-1 text-xs text-[#0F3F3A]/60">Statut: {status}</p>
            </div>
          </div>

          {status === "trial" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <p className="font-medium text-[#0F3F3A]/80">Progression de l&apos;essai</p>
                <p className="font-semibold text-[#1F7A6C]">
                  {remainingDays !== null ? `${remainingDays} jour${remainingDays > 1 ? "s" : ""} restants` : "--"}
                </p>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#DBEEE8]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}

          {status === "expired" ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">
              Votre essai est termine. Choisissez un plan pour redebloquer immediatement votre espace ZenGrow.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {PLAN_ITEMS.map((item) => (
          <Card
            key={item.key}
            className={[
              "relative overflow-hidden rounded-[30px] border bg-white p-1 shadow-[0_24px_55px_-42px_rgba(15,63,58,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_65px_-40px_rgba(15,63,58,0.75)]",
              item.featured ? "border-[#43BDA0] shadow-[0_30px_70px_-38px_rgba(31,122,108,0.65)]" : "border-[#DDEFEA]",
            ].join(" ")}
          >
            {item.featured ? (
              <span className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] px-3 py-1 text-xs font-semibold text-white shadow-[0_14px_30px_-18px_rgba(31,122,108,0.9)]">
                Le plus populaire
              </span>
            ) : null}

            <div
              className={[
                "h-full rounded-[26px] border px-6 py-7 md:px-7 md:py-8",
                item.featured ? "border-[#D4EEE8] bg-gradient-to-b from-[#F4FCF9] to-white" : "border-[#E6F2EE] bg-white",
              ].join(" ")}
            >
              <CardHeader className="space-y-3 p-0">
                <CardTitle className="text-2xl font-semibold tracking-tight text-[#0F3F3A]">{item.title}</CardTitle>
                <CardDescription className="text-sm text-[#0F3F3A]/65">{item.subtitle}</CardDescription>
                <p className="text-3xl font-semibold tracking-tight text-[#0F3F3A]">{item.price}</p>
              </CardHeader>

              <CardContent className="space-y-6 p-0 pt-6">
                <ul className="space-y-3 text-sm text-[#0F3F3A]/85">
                  {item.features.map((feature) => (
                    <FeatureItem key={`${item.key}-${feature.label}`} icon={feature.icon} label={feature.label} />
                  ))}
                </ul>

                <Button
                  type="button"
                  onClick={() => startCheckout(item.key)}
                  disabled={Boolean(loadingPlan)}
                  className={[
                    "h-12 w-full rounded-full text-sm font-semibold transition-all duration-300",
                    item.featured
                      ? "bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] text-white shadow-[0_20px_36px_-18px_rgba(31,122,108,0.9)] hover:scale-[1.01] hover:shadow-[0_24px_40px_-18px_rgba(31,122,108,0.95)]"
                      : "bg-[#0F3F3A] text-white shadow-[0_16px_30px_-20px_rgba(15,63,58,0.95)] hover:bg-[#185C54]",
                  ].join(" ")}
                >
                  {loadingPlan === item.key ? "Redirection..." : item.cta}
                </Button>

                <p className="text-center text-xs text-[#0F3F3A]/55">Sans engagement long terme - annulation a tout moment</p>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>

      {message ? (
        <p className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)]/80 shadow-sm">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function FeatureItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EAF8F4] text-[#1F7A6C]">
        <Check size={14} strokeWidth={2.5} />
      </span>
      <span className="inline-flex items-center gap-2">
        <Icon size={15} className="text-[#1F7A6C]/75" />
        <span>{label}</span>
      </span>
    </li>
  );
}
