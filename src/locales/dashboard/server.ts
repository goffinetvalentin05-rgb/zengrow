import { cookies } from "next/headers";
import { DASHBOARD_LOCALE_COOKIE } from "@/src/lib/sharpz/constants";
import {
  DEFAULT_DASHBOARD_LOCALE,
  getDashboardDictionary,
  isDashboardLocale,
  type DashboardLocale,
} from "@/src/locales/dashboard";

export async function getDashboardLocale(): Promise<DashboardLocale> {
  const store = await cookies();
  const raw = store.get(DASHBOARD_LOCALE_COOKIE)?.value ?? store.get("sharpz_dashboard_locale")?.value;
  return isDashboardLocale(raw) ? raw : DEFAULT_DASHBOARD_LOCALE;
}

export async function getDashboardT() {
  const locale = await getDashboardLocale();
  return { locale, t: getDashboardDictionary(locale) };
}
