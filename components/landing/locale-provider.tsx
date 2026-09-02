"use client";

import type { ReactNode } from "react";
import { I18nProvider, useI18n } from "@/src/i18n/provider";
import type { Locale } from "@/src/i18n/locale";
import type { LandingDictionary } from "./locales";

export function LocaleProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useLocale(): {
  locale: Locale;
  t: LandingDictionary;
  setLocale: (locale: Locale) => void;
} {
  const { locale, setLocale, t } = useI18n();
  return {
    locale,
    setLocale,
    t: { ...t.landing, lang: t.lang },
  };
}
