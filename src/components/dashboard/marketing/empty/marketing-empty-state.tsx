"use client";

import MarketingEmptyPanel from "@/src/components/dashboard/marketing/empty/marketing-empty-panel";
import MarketingTemplateGrid from "@/src/components/dashboard/marketing/quick-actions/marketing-template-grid";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import Button from "@/src/components/ui/button";
import { Megaphone } from "lucide-react";

export default function MarketingEmptyState() {
  const { openCreateForm } = useMarketing();

  return (
    <div className="space-y-8 md:space-y-10">
      <MarketingEmptyPanel className="min-h-[min(360px,55vh)]">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zg-accent-soft-bg text-3xl sm:h-[4.5rem] sm:w-[4.5rem] sm:text-4xl"
            aria-hidden
          >
            <span aria-hidden>📨</span>
          </div>
          <h2 className="mt-5 text-lg font-semibold text-zg-fg sm:text-xl">
            Lancez votre première campagne
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zg-text-muted sm:text-[0.9375rem]">
            Envoyez un e-mail groupé à vos acheteurs pour une offre, un événement ou une relance.
          </p>
          <Button
            type="button"
            variant="primary"
            size="md"
            className="mt-6 w-full sm:w-auto"
            onClick={openCreateForm}
          >
            <Megaphone className="h-4 w-4" strokeWidth={2} aria-hidden />
            Créer ma première campagne
          </Button>
        </div>
      </MarketingEmptyPanel>

      <section aria-labelledby="marketing-empty-templates-heading" className="space-y-4">
        <div className="text-center sm:text-left">
          <h2 id="marketing-empty-templates-heading" className="text-base font-semibold text-zg-fg">
            Ou choisissez un modèle ci-dessous
          </h2>
          <p className="mt-1 text-sm text-zg-text-muted">
            Des idées prêtes à personnaliser avant l&apos;envoi
          </p>
        </div>
        <MarketingTemplateGrid />
      </section>
    </div>
  );
}
