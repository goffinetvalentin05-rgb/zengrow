"use client";

import { I18nProvider } from "@/src/i18n/provider";
import type { Locale } from "@/src/i18n/locale";
import type { ReactNode } from "react";

export function AppI18nTree({
  children,
  initialLocale,
  profileLocale = null,
}: {
  children: ReactNode;
  initialLocale: Locale;
  profileLocale?: Locale | null;
}) {
  return (
    <I18nProvider initialLocale={initialLocale} profileLocale={profileLocale}>
      {children}
    </I18nProvider>
  );
}
