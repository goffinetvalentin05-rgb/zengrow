import { en as landingEn } from "@/components/landing/locales/en";
import { fr as landingFr } from "@/components/landing/locales/fr";
import type { LandingDictionary } from "@/components/landing/locales/types";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/src/i18n/locale";
import { appEn } from "./en";
import { appFr, type AppDictionary } from "./fr";

export type { AppDictionary };

export type Messages = AppDictionary & {
  landing: LandingDictionary;
};

const landing = { fr: landingFr, en: landingEn } as const;
const app: Record<Locale, AppDictionary> = { fr: appFr as unknown as AppDictionary, en: appEn };

export function getMessages(locale: Locale): Messages {
  const resolved = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const appDict = app[resolved] ?? app[DEFAULT_LOCALE];
  const landingDict = landing[resolved] ?? landing[DEFAULT_LOCALE];
  return {
    ...appDict,
    landing: landingDict,
  };
}

export function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = vars[key];
    return value == null ? `{${key}}` : String(value);
  });
}
