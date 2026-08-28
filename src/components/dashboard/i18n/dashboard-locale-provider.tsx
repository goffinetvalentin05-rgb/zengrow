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
import { DASHBOARD_LOCALE_COOKIE, DASHBOARD_LOCALE_STORAGE } from "@/src/lib/sharpz/constants";
import {
  DEFAULT_DASHBOARD_LOCALE,
  getDashboardDictionary,
  isDashboardLocale,
  type DashboardDictionary,
  type DashboardLocale,
} from "@/src/locales/dashboard";

type DashboardLocaleContextValue = {
  locale: DashboardLocale;
  t: DashboardDictionary;
  setLocale: (locale: DashboardLocale) => void;
};

const DashboardLocaleContext = createContext<DashboardLocaleContextValue | null>(null);

function persistLocale(locale: DashboardLocale) {
  try {
    window.localStorage.setItem(DASHBOARD_LOCALE_STORAGE, locale);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${DASHBOARD_LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
  document.documentElement.lang = locale;
}

export function DashboardLocaleProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: DashboardLocale;
}) {
  const [locale, setLocaleState] = useState<DashboardLocale>(initialLocale);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DASHBOARD_LOCALE_STORAGE);
      if (isDashboardLocale(stored) && stored !== locale) {
        setLocaleState(stored);
        persistLocale(stored);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((next: DashboardLocale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      t: getDashboardDictionary(locale),
      setLocale,
    }),
    [locale, setLocale],
  );

  return <DashboardLocaleContext.Provider value={value}>{children}</DashboardLocaleContext.Provider>;
}

export function useDashboardI18n() {
  const ctx = useContext(DashboardLocaleContext);
  if (!ctx) {
    throw new Error("useDashboardI18n must be used within DashboardLocaleProvider");
  }
  return ctx;
}
