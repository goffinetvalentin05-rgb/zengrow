"use client";

import MarketingTemplateCard from "@/src/components/dashboard/marketing/quick-actions/marketing-template-card";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import { CAMPAIGN_TEMPLATES } from "@/src/components/dashboard/marketing/utils/campaign-templates";

export default function MarketingQuickActions() {
  const { openCreateFormWithTemplate } = useMarketing();

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {CAMPAIGN_TEMPLATES.map((template) => (
          <MarketingTemplateCard
            key={template.id}
            template={template}
            onCreate={() => openCreateFormWithTemplate(template.id)}
          />
        ))}
      </div>
    </section>
  );
}
