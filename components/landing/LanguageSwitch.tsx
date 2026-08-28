"use client";

import { useLocale } from "./locale-provider";
import type { Locale } from "./locales";
import { cn } from "@/src/lib/utils";

export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className={cn("go-lang", className)} role="group" aria-label={t.lang.switchAria}>
      {(["fr", "en"] as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          className={cn("go-lang__btn", locale === code && "is-active")}
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
        >
          {code === "fr" ? t.lang.fr : t.lang.en}
        </button>
      ))}
    </div>
  );
}
