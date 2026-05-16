import type {
  CampaignAudienceFilter,
  CampaignTemplateId,
} from "@/src/components/dashboard/marketing/utils/campaign-templates";
import type { MarketingKpis } from "@/src/components/dashboard/marketing/utils/marketing-kpis";

export type { CampaignAudienceFilter };

export type CampaignStatus = "sent" | "draft";

export type CampaignRecord = {
  id: string;
  name: string;
  subject: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  sentAt: string | null;
  status: CampaignStatus;
  recipientsCount: number;
  openedCount: number;
};

export type CampaignRecipientDetail = {
  email: string;
  openedAt: string | null;
  sentAt: string;
};

export type MarketingBrandContext = {
  restaurantName: string;
  restaurantLogoUrl: string | null;
  reservationUrl: string;
};

export type CampaignCreateDraft = {
  name: string;
  subject: string;
  content: string;
  imageUrl: string;
  audience: CampaignAudienceFilter;
  templateId: CampaignTemplateId | null;
};

export const EMPTY_CAMPAIGN_CREATE_DRAFT: CampaignCreateDraft = {
  name: "",
  subject: "",
  content: "",
  imageUrl: "",
  audience: "all_customers",
  templateId: null,
};

export type MarketingPageProps = {
  campaigns: CampaignRecord[];
  kpis: MarketingKpis;
  recipientsByCampaignId: Record<string, CampaignRecipientDetail[]>;
  brand: MarketingBrandContext;
  initialOpenCampaignId?: string | null;
};
