export const LOCALES = ["fr", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_COOKIE = "sharpz_locale";
export const LOCALE_STORAGE = "sharpz_locale";

const LEGACY_STORAGE_KEYS = ["zengrow-landing-locale", "sharpz_dashboard_locale"] as const;
const LEGACY_COOKIE_KEYS = ["sharpz_dashboard_locale", "zengrow-landing-locale"] as const;

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "fr" || value === "en";
}

export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return "en";
  const parts = header.split(",");
  for (const part of parts) {
    const code = part.split(";")[0]?.trim().toLowerCase() ?? "";
    if (code.startsWith("fr")) return "fr";
    if (code.startsWith("en")) return "en";
  }
  return "en";
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const candidates = [navigator.language, ...(navigator.languages ?? [])];
  for (const item of candidates) {
    if (item?.toLowerCase().startsWith("fr")) return "fr";
  }
  return "en";
}

export function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const current = window.localStorage.getItem(LOCALE_STORAGE);
    if (isLocale(current)) return current;
    for (const key of LEGACY_STORAGE_KEYS) {
      const legacy = window.localStorage.getItem(key);
      if (isLocale(legacy)) return legacy;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function persistLocale(locale: Locale) {
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
  }
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE, locale);
    for (const key of LEGACY_STORAGE_KEYS) {
      window.localStorage.setItem(key, locale);
    }
  } catch {
    /* ignore */
  }
}

export function readCookieLocale(cookieHeader: string | null | undefined): Locale | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";");
  const wanted = [LOCALE_COOKIE, ...LEGACY_COOKIE_KEYS];
  for (const name of wanted) {
    for (const part of cookies) {
      const [rawName, ...rest] = part.trim().split("=");
      const value = rest.join("=");
      if (rawName === name && isLocale(value)) return value;
    }
  }
  return null;
}

export function localeCookieOptions() {
  return {
    path: "/",
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax" as const,
  };
}

export function warnMissingKey(path: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[i18n] missing key: ${path}`);
  }
}

export function pickLabel(map: Record<string, string> | undefined, key: string, fallback?: string) {
  const value = map?.[key];
  if (typeof value === "string" && value.length) return value;
  warnMissingKey(key);
  return fallback ?? key;
}
