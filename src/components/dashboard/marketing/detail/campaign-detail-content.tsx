"use client";

import CampaignDetailSection from "@/src/components/dashboard/marketing/detail/campaign-detail-section";
import type { CampaignRecord } from "@/src/components/dashboard/marketing/types";

type CampaignDetailContentProps = {
  campaign: CampaignRecord;
};

export default function CampaignDetailContent({ campaign }: CampaignDetailContentProps) {
  return (
    <CampaignDetailSection title="Contenu">
      <dl className="space-y-4 text-sm">
        <div>
          <dt className="dashboard-field-label">Objet</dt>
          <dd className="mt-1 font-semibold text-zg-fg">{campaign.subject}</dd>
        </div>
        <div>
          <dt className="dashboard-field-label">Préheader</dt>
          <dd className="mt-1 text-zg-text-muted">— (bientôt disponible)</dd>
        </div>
        <div>
          <dt className="dashboard-field-label">Version texte seul</dt>
          <dd className="mt-2 whitespace-pre-wrap rounded-xl border border-zg-border bg-zg-surface-soft/80 p-4 leading-relaxed text-zg-fg">
            {campaign.content.trim() || "—"}
          </dd>
        </div>
      </dl>
    </CampaignDetailSection>
  );
}
