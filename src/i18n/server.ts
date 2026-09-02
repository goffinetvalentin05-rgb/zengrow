import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  isLocale,
  localeFromAcceptLanguage,
  LOCALE_COOKIE,
  type Locale,
} from "@/src/i18n/locale";
import { getMessages } from "@/src/locales/app";

const LEGACY_COOKIES = ["sharpz_dashboard_locale", "zengrow-landing-locale"] as const;

export async function getRequestLocale(): Promise<Locale> {
  const store = await cookies();
  const current = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(current)) return current;
  for (const name of LEGACY_COOKIES) {
    const legacy = store.get(name)?.value;
    if (isLocale(legacy)) return legacy;
  }
  const headerStore = await headers();
  return localeFromAcceptLanguage(headerStore.get("accept-language"));
}

export async function getMessagesForRequest() {
  const locale = await getRequestLocale();
  return { locale, t: getMessages(locale) };
}

export function fallbackLocale(locale: Locale | null | undefined): Locale {
  return isLocale(locale) ? locale : DEFAULT_LOCALE;
}
