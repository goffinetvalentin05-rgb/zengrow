"use client";

import MarketingTemplateGrid from "@/src/components/dashboard/marketing/quick-actions/marketing-template-grid";

export default function MarketingQuickActions() {
  return (
    <section aria-labelledby="marketing-quick-actions-heading" className="space-y-4">
      <div>
        <h2 id="marketing-quick-actions-heading" className="text-base font-semibold text-zg-fg">
          Modèles de campagnes
        </h2>
        <p className="mt-1 text-sm text-zg-text-muted">
          Choisissez un modèle visuel, puis personnalisez avant l&apos;envoi
        </p>
      </div>
      <MarketingTemplateGrid />
    </section>
  );
}
