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
    <section className="space-y-4">
      <div className="overflow-hidden rounded-[30px] border border-[#D6ECE6] bg-[var(--surface)] shadow-[0_20px_46px_-34px_rgba(15,63,58,0.45)]">
        <div className="space-y-5 border-b border-[#E3F2ED] px-5 py-5 md:px-6 md:py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#CBE6DF] bg-white px-3 py-1 text-xs font-semibold tracking-[0.08em] text-[#1F7A6C]">
                <Sparkles size={14} />
                Facturation ZenGrow
              </p>
              <h2 className="text-xl font-semibold tracking-tight text-[#0F3F3A] md:text-2xl">
                {status === "trial" ? "Votre essai gratuit est actif" : "Choisissez le plan adapte a votre restaurant"}
              </h2>
              <p className="max-w-2xl text-sm text-[#0F3F3A]/70 md:text-base">
                {status === "trial" && formattedTrialDate
                  ? `Votre essai se termine le ${formattedTrialDate}.`
                  : "Activez un abonnement pour continuer a utiliser toutes les fonctionnalites ZenGrow."}
              </p>
            </div>

            <div className="rounded-2xl border border-[#DCEEE9] bg-white px-4 py-3 text-right">
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
        </div>

        <div className="space-y-4 px-5 py-5 md:px-6 md:py-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#0F3F3A]/55">Plans d&apos;abonnement</p>
            <p className="text-xs text-[#0F3F3A]/55">35 CHF ou 49 CHF par mois</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {PLAN_ITEMS.map((item) => (
              <div
                key={item.key}
                className={[
                  "relative rounded-3xl border px-5 py-5 transition-all",
                  item.featured ? "border-[#43BDA0] bg-[#F4FCF9]" : "border-[#E2F0EC] bg-[#FAFDFC]",
                ].join(" ")}
              >
                {item.featured ? (
                  <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] px-3 py-1 text-[11px] font-semibold text-white">
                    Le plus populaire
                  </span>
                ) : null}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-[#0F3F3A]">{item.title}</h3>
                    <p className="mt-1 text-sm text-[#0F3F3A]/65">{item.subtitle}</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-[#0F3F3A]">{item.price}</p>
                  </div>

                  <ul className="space-y-2.5 text-sm text-[#0F3F3A]/85">
                    {item.features.map((feature) => (
                      <FeatureItem key={`${item.key}-${feature.label}`} icon={feature.icon} label={feature.label} />
                    ))}
                  </ul>

                  <Button
                    type="button"
                    onClick={() => startCheckout(item.key)}
                    disabled={Boolean(loadingPlan)}
                    className={[
                      "h-11 w-full rounded-full text-sm font-semibold transition-all duration-300",
                      item.featured
                        ? "bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] text-white shadow-[0_18px_32px_-18px_rgba(31,122,108,0.9)] hover:scale-[1.01]"
                        : "bg-[#0F3F3A] text-white hover:bg-[#185C54]",
                    ].join(" ")}
                  >
                    {loadingPlan === item.key ? "Redirection..." : item.cta}
                  </Button>

                  <p className="text-center text-xs text-[#0F3F3A]/55">Sans engagement long terme</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {message ? (
        <p className="rounded-2xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm text-[var(--foreground)]/80">
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
