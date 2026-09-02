"use client";

import { cn } from "@/src/lib/utils";
import { useI18n } from "@/src/i18n/provider";
import type { Locale } from "@/src/i18n/locale";

type Props = {
  className?: string;
  variant?: "landing" | "app" | "auth";
};

const OPTIONS: Locale[] = ["fr", "en"];

export function LanguageSwitch({ className, variant = "app" }: Props) {
  const { locale, setLocale, t } = useI18n();

  if (variant === "landing") {
    return (
      <div className={cn("go-lang", className)} role="group" aria-label={t.lang.switchAria}>
        {OPTIONS.map((code) => (
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

  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-white/[0.1] bg-white/[0.03] p-1",
        variant === "auth" && "border-white/15 bg-white/5",
        className,
      )}
      role="group"
      aria-label={t.lang.switchAria}
    >
      {OPTIONS.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={cn(
              "min-h-8 min-w-10 rounded-full px-3 text-[11px] font-semibold uppercase tracking-wide transition-colors",
              active ? "bg-white text-zinc-950" : "text-white/45 hover:text-white",
            )}
          >
            {code === "fr" ? t.lang.fr : t.lang.en}
          </button>
        );
      })}
    </div>
  );
}
