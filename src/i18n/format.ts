import type { Locale } from "@/src/i18n/locale";

export function dateLocale(locale: Locale) {
  return locale === "en" ? "en-US" : "fr-FR";
}

export function numberLocale(locale: Locale) {
  return locale === "en" ? "en-US" : "fr-FR";
}

export function formatLocaleDate(value: Date | string | number, locale: Locale) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(dateLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatLocaleNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(numberLocale(locale)).format(value);
}

export function formatFollowers(count: number, locale: Locale) {
  if (locale === "fr") {
    return count === 1 ? "1 abonné" : `${formatLocaleNumber(count, locale)} abonnés`;
  }
  return count === 1 ? "1 follower" : `${formatLocaleNumber(count, locale)} followers`;
}
