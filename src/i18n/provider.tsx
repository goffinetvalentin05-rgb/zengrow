"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  detectBrowserLocale,
  isLocale,
  persistLocale,
  readStoredLocale,
  type Locale,
} from "@/src/i18n/locale";
import { getMessages, type Messages } from "@/src/locales/app";

type I18nContextValue = {
  locale: Locale;
  t: Messages;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function saveLocaleToProfile(locale: Locale) {
  void fetch("/api/discovery/locale", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ locale }),
  }).catch(() => {
    /* visitor or unauthenticated — cookie/localStorage is enough */
  });
}

export function I18nProvider({
  children,
  initialLocale,
  profileLocale = null,
}: {
  children: ReactNode;
  initialLocale: Locale;
  profileLocale?: Locale | null;
}) {
  const [locale, setLocaleState] = useState<Locale>(isLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE);

  useEffect(() => {
    const stored = readStoredLocale();
    let next: Locale | null = null;
    if (isLocale(profileLocale)) next = profileLocale;
    else if (stored) next = stored;
    else if (!isLocale(initialLocale)) next = detectBrowserLocale();

    if (next && next !== locale) {
      setLocaleState(next);
      persistLocale(next);
      return;
    }
    persistLocale(locale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    setLocaleState(next);
    persistLocale(next);
    saveLocaleToProfile(next);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      t: getMessages(locale),
      setLocale,
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
