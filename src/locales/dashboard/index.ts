import { en } from "./en";
import { fr, type DashboardDictionary } from "./fr";

export type { DashboardDictionary };
export type DashboardLocale = "fr" | "en";

export const DEFAULT_DASHBOARD_LOCALE: DashboardLocale = "fr";

export const dashboardDictionaries: Record<DashboardLocale, DashboardDictionary> = {
  fr,
  en,
};

export function isDashboardLocale(value: string | null | undefined): value is DashboardLocale {
  return value === "fr" || value === "en";
}

export function getDashboardDictionary(locale: DashboardLocale): DashboardDictionary {
  return dashboardDictionaries[locale] ?? dashboardDictionaries[DEFAULT_DASHBOARD_LOCALE];
}
