"use client";

import type { CampaignTemplate } from "@/src/components/dashboard/marketing/utils/campaign-templates";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

type MarketingTemplateCardProps = {
  template: CampaignTemplate;
  onCreate: () => void;
  className?: string;
};

export default function MarketingTemplateCard({ template, onCreate, className }: MarketingTemplateCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col rounded-2xl border border-zg-border bg-zg-surface p-5 transition-all duration-200 ease-out sm:p-6",
        "hover:border-zg-border-hover hover:bg-zg-card-hover hover:shadow-zg-soft",
        className,
      )}
    >
      <p className="text-3xl leading-none" aria-hidden>
        {template.emoji}
      </p>
      <h3 className="mt-4 text-base font-semibold text-zg-fg">{template.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-zg-text-muted">{template.description}</p>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-5 w-full sm:w-auto"
        onClick={onCreate}
      >
        Créer
      </Button>
    </article>
  );
}
