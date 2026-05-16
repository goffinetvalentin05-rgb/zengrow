"use client";

import MarketingTemplateGrid from "@/src/components/dashboard/marketing/quick-actions/marketing-template-grid";

export default function MarketingQuickActions() {
  return (
    <section aria-labelledby="marketing-quick-actions-heading" className="space-y-4">
      <div>
        <h2 id="marketing-quick-actions-heading" className="text-base font-semibold text-zg-fg">
          Actions rapides
        </h2>
        <p className="mt-1 text-sm text-zg-text-muted">
          Lancez une campagne pré-remplie en un clic
        </p>
      </div>
      <MarketingTemplateGrid />
    </section>
  );
}
