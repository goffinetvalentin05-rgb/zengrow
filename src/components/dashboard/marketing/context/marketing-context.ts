"use client";

import { createContext, type Dispatch, type SetStateAction } from "react";
import type {
  CampaignCreateDraft,
  CampaignRecord,
  CampaignRecipientDetail,
  MarketingBrandContext,
} from "@/src/components/dashboard/marketing/types";
import type { CampaignTemplateId } from "@/src/components/dashboard/marketing/utils/campaign-templates";
import type { CampaignFilters } from "@/src/components/dashboard/marketing/utils/campaign-filters";
import type { MarketingKpis } from "@/src/components/dashboard/marketing/utils/marketing-kpis";

export type MarketingContextValue = {
  campaigns: CampaignRecord[];
  filteredCampaigns: CampaignRecord[];
  kpis: MarketingKpis;
  recipientsByCampaignId: Record<string, CampaignRecipientDetail[]>;
  brand: MarketingBrandContext;
  filters: CampaignFilters;
  setFilters: Dispatch<SetStateAction<CampaignFilters>>;
  resetFilters: () => void;
  showCreateForm: boolean;
  createDraft: CampaignCreateDraft;
  setCreateDraft: Dispatch<SetStateAction<CampaignCreateDraft>>;
  openCreateForm: () => void;
  openCreateFormWithTemplate: (templateId: CampaignTemplateId) => void;
  closeCreateForm: () => void;
  duplicateCampaign: (campaign: CampaignRecord) => void;
  deleteCampaign: (campaignId: string) => Promise<void>;
  deletingCampaignId: string | null;
  selectedCampaignId: string | null;
  selectedCampaign: CampaignRecord | null;
  openCampaignDetail: (campaignId: string) => void;
  closeCampaignDetail: () => void;
  createMessage: string | null;
  setCreateMessage: Dispatch<SetStateAction<string | null>>;
};

export const MarketingContext = createContext<MarketingContextValue | null>(null);
