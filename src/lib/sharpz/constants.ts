import type {
  ActionCategory,
  ChannelKey,
  IntegrationProvider,
  ObjectiveKey,
  OpportunityCategory,
  SaasStage,
} from "@/src/lib/sharpz/types";

export const SAAS_STAGES: SaasStage[] = ["idea", "mvp", "launch", "first_customers", "growth"];

export const OBJECTIVE_KEYS: ObjectiveKey[] = [
  "first_customers",
  "more_prospects",
  "increase_mrr",
  "improve_conversion",
  "reduce_churn",
  "find_acquisition_channel",
  "improve_positioning",
  "other",
];

export const CHANNEL_KEYS: ChannelKey[] = [
  "linkedin",
  "x",
  "tiktok",
  "instagram",
  "youtube",
  "reddit",
  "seo",
  "cold_email",
  "cold_call",
  "paid_ads",
  "partnerships",
  "other",
];

export const ACTION_CATEGORIES: ActionCategory[] = [
  "acquisition",
  "conversion",
  "landing",
  "pricing",
  "content",
  "seo",
  "retention",
  "market",
  "prospection",
  "monetisation",
  "positioning",
];

export const GROWTH_CATEGORIES: OpportunityCategory[] = [
  "acquisition",
  "conversion",
  "monetisation",
  "retention",
  "positioning",
];

export const INTEGRATION_PROVIDERS: { provider: IntegrationProvider; defaultStatus: "available" | "coming_soon" }[] =
  [
    { provider: "sharpz_analytics", defaultStatus: "available" },
    { provider: "stripe", defaultStatus: "available" },
    { provider: "paddle", defaultStatus: "coming_soon" },
    { provider: "google_analytics", defaultStatus: "available" },
    { provider: "posthog", defaultStatus: "available" },
    { provider: "supabase", defaultStatus: "coming_soon" },
    { provider: "search_console", defaultStatus: "coming_soon" },
  ];

export const OBJECTIVE_PRIORITY_CATEGORIES: Record<ObjectiveKey, ActionCategory[]> = {
  first_customers: ["prospection", "acquisition", "landing", "positioning", "content"],
  more_prospects: ["prospection", "acquisition", "content", "positioning"],
  increase_mrr: ["monetisation", "pricing", "conversion", "acquisition"],
  improve_conversion: ["conversion", "landing", "pricing", "seo"],
  reduce_churn: ["retention", "conversion", "content"],
  find_acquisition_channel: ["acquisition", "content", "market", "prospection"],
  improve_positioning: ["positioning", "landing", "content", "market"],
  other: ["acquisition", "conversion", "content"],
};

export const DASHBOARD_LOCALE_COOKIE = "sharpz_locale";
export const DASHBOARD_LOCALE_STORAGE = "sharpz_locale";
