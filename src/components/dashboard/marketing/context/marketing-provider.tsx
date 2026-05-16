"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { MarketingContext } from "@/src/components/dashboard/marketing/context/marketing-context";
import {
  EMPTY_CAMPAIGN_CREATE_DRAFT,
  type CampaignCreateDraft,
  type CampaignRecord,
  type MarketingPageProps,
} from "@/src/components/dashboard/marketing/types";
import {
  DEFAULT_CAMPAIGN_FILTERS,
  filterCampaigns,
  type CampaignFilters,
} from "@/src/components/dashboard/marketing/utils/campaign-filters";
import {
  getCampaignTemplate,
  type CampaignTemplateId,
} from "@/src/components/dashboard/marketing/utils/campaign-templates";
import { useDashboardToast } from "@/src/components/dashboard/dashboard-toast-provider";
import { createClient } from "@/src/lib/supabase/client";

type MarketingProviderProps = MarketingPageProps & {
  children: ReactNode;
};

function draftFromTemplate(templateId: CampaignTemplateId): CampaignCreateDraft {
  const template = getCampaignTemplate(templateId);
  if (!template) {
    return { ...EMPTY_CAMPAIGN_CREATE_DRAFT };
  }
  return {
    name: template.draft.name,
    subject: template.draft.subject,
    content: template.draft.content,
    imageUrl: "",
    audience: template.draft.audience,
    templateId: template.id,
  };
}

function draftFromCampaign(campaign: CampaignRecord): CampaignCreateDraft {
  return {
    name: `${campaign.name} (copie)`,
    subject: campaign.subject,
    content: campaign.content,
    imageUrl: campaign.imageUrl ?? "",
    audience: "all_customers",
    templateId: null,
  };
}

export function MarketingProvider({
  campaigns: initialCampaigns,
  kpis: initialKpis,
  children,
}: MarketingProviderProps) {
  const router = useRouter();
  const showToast = useDashboardToast();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [kpis, setKpis] = useState(initialKpis);
  const [filters, setFilters] = useState<CampaignFilters>(DEFAULT_CAMPAIGN_FILTERS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createDraft, setCreateDraft] = useState<CampaignCreateDraft>(EMPTY_CAMPAIGN_CREATE_DRAFT);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [deletingCampaignId, setDeletingCampaignId] = useState<string | null>(null);

  useEffect(() => {
    setCampaigns(initialCampaigns);
    setKpis(initialKpis);
  }, [initialCampaigns, initialKpis]);

  const filteredCampaigns = useMemo(
    () => filterCampaigns(campaigns, filters),
    [campaigns, filters],
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_CAMPAIGN_FILTERS);
  }, []);

  const openCreateForm = useCallback(() => {
    setCreateDraft(EMPTY_CAMPAIGN_CREATE_DRAFT);
    setShowCreateForm(true);
    setCreateMessage(null);
  }, []);

  const openCreateFormWithTemplate = useCallback((templateId: CampaignTemplateId) => {
    setCreateDraft(draftFromTemplate(templateId));
    setShowCreateForm(true);
    setCreateMessage(null);
    requestAnimationFrame(() => {
      document.getElementById("marketing-create-form")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, []);

  const closeCreateForm = useCallback(() => {
    setShowCreateForm(false);
    setCreateDraft(EMPTY_CAMPAIGN_CREATE_DRAFT);
  }, []);

  const duplicateCampaign = useCallback((campaign: CampaignRecord) => {
    setCreateDraft(draftFromCampaign(campaign));
    setShowCreateForm(true);
    setCreateMessage(null);
    requestAnimationFrame(() => {
      document.getElementById("marketing-create-form")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    showToast({ message: "Campagne dupliquée dans l’éditeur — ajustez puis envoyez." });
  }, [showToast]);

  const deleteCampaign = useCallback(
    async (campaignId: string) => {
      const campaign = campaigns.find((c) => c.id === campaignId);
      if (!campaign || campaign.status !== "draft") return;

      setDeletingCampaignId(campaignId);
      const supabase = createClient();
      const { error } = await supabase.from("email_campaigns").delete().eq("id", campaignId);

      setDeletingCampaignId(null);

      if (error) {
        showToast({ message: "Impossible de supprimer ce brouillon." });
        return;
      }

      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      if (selectedCampaignId === campaignId) {
        setSelectedCampaignId(null);
      }
      showToast({ message: "Brouillon supprimé." });
      router.refresh();
    },
    [campaigns, router, selectedCampaignId, showToast],
  );

  const openCampaignDetail = useCallback((campaignId: string) => {
    setSelectedCampaignId(campaignId);
  }, []);

  const closeCampaignDetail = useCallback(() => {
    setSelectedCampaignId(null);
  }, []);

  return (
    <MarketingContext.Provider
      value={{
        campaigns,
        filteredCampaigns,
        kpis,
        filters,
        setFilters,
        resetFilters,
        showCreateForm,
        createDraft,
        setCreateDraft,
        openCreateForm,
        openCreateFormWithTemplate,
        closeCreateForm,
        duplicateCampaign,
        deleteCampaign,
        deletingCampaignId,
        selectedCampaignId,
        openCampaignDetail,
        closeCampaignDetail,
        createMessage,
        setCreateMessage,
      }}
    >
      {children}
    </MarketingContext.Provider>
  );
}
