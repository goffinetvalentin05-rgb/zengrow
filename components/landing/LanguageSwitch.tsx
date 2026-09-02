"use client";

import { LanguageSwitch as SharedLanguageSwitch } from "@/src/i18n/language-switch";

export function LanguageSwitch({ className }: { className?: string }) {
  return <SharedLanguageSwitch variant="landing" className={className} />;
}
