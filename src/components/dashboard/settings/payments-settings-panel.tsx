"use client";

import { CreditCard, Wallet } from "lucide-react";
import BillingPlans from "@/src/components/dashboard/billing-plans";
import { SettingsAccordion } from "@/src/components/dashboard/settings/settings-accordion";
import { SettingsCategoryCard } from "@/src/components/dashboard/settings/settings-category-card";
import type { SubscriptionPlan, SubscriptionStatus } from "@/src/lib/subscription";

type PaymentsSettingsPanelProps = {
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan;
  trialEndDate: string | null;
  isOwnerDev: boolean;
};

export function PaymentsSettingsPanel({
  subscriptionStatus,
  subscriptionPlan,
  trialEndDate,
  isOwnerDev,
}: PaymentsSettingsPanelProps) {
  const subscriptionConnected = subscriptionStatus === "active";

  return (
    <div className="space-y-6">
      <SettingsCategoryCard
        icon={CreditCard}
        iconWrapClassName="bg-[#A855F7]/15 text-[#A855F7]"
        iconClassName="text-[#A855F7]"
        title="Facturation"
        subtitle="Abonnement ZenGrow, vérifié côté serveur."
      >
        <SettingsAccordion title="Plan actuel et abonnement" defaultOpen>
          <BillingPlans
            status={subscriptionStatus}
            plan={subscriptionPlan}
            trialEndDate={trialEndDate}
            isOwnerDev={isOwnerDev}
          />
        </SettingsAccordion>
      </SettingsCategoryCard>

      <SettingsCategoryCard
        icon={Wallet}
        iconWrapClassName="bg-zg-accent/15 text-zg-accent"
        iconClassName="text-zg-accent"
        title="Paiements bons cadeaux"
        subtitle="Encaissement des ventes de bons."
      >
        <SettingsAccordion title="État" defaultOpen>
          <dl className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3 rounded-xl border border-zg-border px-4 py-3">
              <div>
                <dt className="font-medium text-zg-fg">Abonnement Stripe</dt>
                <dd className="mt-0.5 text-xs text-zg-text-muted">
                  {subscriptionConnected
                    ? "Actif — confirmé par le serveur (webhook Stripe)."
                    : subscriptionStatus === "trial"
                      ? "Essai en cours — aucun abonnement Stripe actif."
                      : "Aucun abonnement Stripe actif."}
                </dd>
              </div>
              <span className="shrink-0 rounded-full border border-zg-border px-2.5 py-1 text-xs font-semibold text-zg-fg">
                {subscriptionConnected ? "Connecté" : "Non connecté"}
              </span>
            </div>
            <div className="rounded-xl border border-zg-border px-4 py-3">
              <dt className="font-medium text-zg-fg">Devise</dt>
              <dd className="mt-0.5 text-zg-text-muted">
                CHF — utilisée pour tous les bons (création, PDF, Wallet, encaissement).
              </dd>
            </div>
            <div className="rounded-xl border border-zg-border px-4 py-3">
              <dt className="font-medium text-zg-fg">Vente en ligne (Stripe Connect)</dt>
              <dd className="mt-0.5 text-zg-text-muted">
                Pas encore disponible. Les clients envoient une demande depuis votre page publique ; vous créez et
                encaissez les bons depuis le tableau de bord.
              </dd>
            </div>
          </dl>
        </SettingsAccordion>
      </SettingsCategoryCard>
    </div>
  );
}
