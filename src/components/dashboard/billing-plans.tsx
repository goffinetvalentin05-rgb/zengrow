"use client";

import { useState } from "react";
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
    features: [
      "Reservations",
      "Gestion des disponibilites",
      "Demandes d'avis",
      "Feedback prive",
      "Base clients",
    ],
  },
  {
    key: "pro" as const,
    title: "Pro",
    price: "49 CHF / mois",
    features: [
      "Tout Starter",
      "Campagnes marketing",
      "Segmentation clients",
      "Statistiques clients",
      "Export clients",
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

export default function BillingPlans({ status, plan, trialEndDate }: BillingPlansProps) {
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan>(null);
  const [message, setMessage] = useState<string | null>(null);
  const formattedTrialDate = formatDate(trialEndDate);

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
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Facturation ZenGrow</CardTitle>
          <CardDescription>Choisissez votre abonnement pour continuer a utiliser toutes les fonctionnalites.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[var(--foreground)]/80">
          <p>
            Statut actuel: <span className="font-semibold text-[var(--foreground)]">{status}</span>
          </p>
          <p>
            Plan actuel: <span className="font-semibold text-[var(--foreground)]">{plan ?? "Aucun"}</span>
          </p>
          {status === "trial" && formattedTrialDate ? (
            <p>
              Fin de l&apos;essai gratuit:{" "}
              <span className="font-semibold text-[var(--foreground)]">{formattedTrialDate}</span>
            </p>
          ) : null}
          {status === "expired" ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
              Votre essai est termine. Activez un plan pour re-debloquer les reservations et les outils du dashboard.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {PLAN_ITEMS.map((item) => (
          <Card key={item.key} className="rounded-3xl">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.price}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-[var(--foreground)]/80">
                {item.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>

              <Button
                type="button"
                onClick={() => startCheckout(item.key)}
                disabled={Boolean(loadingPlan)}
                className="w-full"
              >
                {loadingPlan === item.key ? "Redirection..." : item.key === "starter" ? "Prendre Starter" : "Prendre Pro"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {message ? (
        <p className="rounded-2xl border border-[var(--border)] bg-white px-4 py-2 text-sm text-[var(--foreground)]/80">
          {message}
        </p>
      ) : null}
    </section>
  );
}
