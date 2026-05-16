"use client";

import MarketingTemplateCard from "@/src/components/dashboard/marketing/quick-actions/marketing-template-card";
import { useMarketing } from "@/src/components/dashboard/marketing/context/use-marketing";
import { CAMPAIGN_TEMPLATES } from "@/src/components/dashboard/marketing/utils/campaign-templates";
import { cn } from "@/src/lib/utils";

type MarketingTemplateGridProps = {
  className?: string;
};

export default function MarketingTemplateGrid({ className }: MarketingTemplateGridProps) {
  const { openCreateFormWithTemplate } = useMarketing();

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6",
        className,
      )}
    >
      {CAMPAIGN_TEMPLATES.map((template) => (
        <MarketingTemplateCard
          key={template.id}
          template={template}
          onCreate={() => openCreateFormWithTemplate(template.id)}
        />
      ))}
    </div>
  );
}
