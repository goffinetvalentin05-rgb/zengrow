/** Routes Sharpz — architecture produit verrouillée (5 sections + réglages). */
export const SHARPZ_ROUTES = {
  agent: "/dashboard",
  today: "/dashboard/today",
  prospects: "/dashboard/prospects",
  analytics: "/dashboard/analytics",
  results: "/dashboard/results",
  settings: "/dashboard/settings",
  onboarding: "/dashboard/onboarding",
} as const;

export type AnalyticsTab = "overview" | "traffic" | "revenue" | "saas" | "market" | "content";

const ANALYTICS_TABS: AnalyticsTab[] = [
  "overview",
  "traffic",
  "revenue",
  "saas",
  "market",
  "content",
];

/** Alias legacy (?tab=analyse) → tab final. */
const ANALYTICS_TAB_ALIASES: Record<string, AnalyticsTab> = {
  analyse: "saas",
};

export function parseAnalyticsTab(value: string | string[] | undefined): AnalyticsTab {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "overview";
  if (ANALYTICS_TABS.includes(raw as AnalyticsTab)) return raw as AnalyticsTab;
  return ANALYTICS_TAB_ALIASES[raw] ?? "overview";
}

export function analyticsHref(tab?: AnalyticsTab): string {
  if (!tab || tab === "overview") return SHARPZ_ROUTES.analytics;
  return `${SHARPZ_ROUTES.analytics}?tab=${tab}`;
}
