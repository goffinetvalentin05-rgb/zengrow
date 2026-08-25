"use client";

import { cn } from "@/src/lib/utils";

export const SETTINGS_SECTION_TABS = [
  { id: "establishment", label: "Établissement" },
  { id: "gift-cards", label: "Bons cadeaux" },
  { id: "payments", label: "Paiements" },
  { id: "sales-channels", label: "Canaux de vente" },
  { id: "notifications", label: "Notifications" },
  { id: "site-integration", label: "Intégration site" },
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTION_TABS)[number]["id"];

export function parseSettingsSection(section: string | null): SettingsSectionId {
  if (section === "subscription") return "payments";
  if (section === "google-reviews") return "notifications";
  if (section === "availability") return "establishment";
  if (SETTINGS_SECTION_TABS.some((tab) => tab.id === section)) {
    return section as SettingsSectionId;
  }
  return "establishment";
}

type SettingsSectionTabsProps = {
  value: SettingsSectionId;
  onChange: (value: SettingsSectionId) => void;
};

export function SettingsSectionTabs({ value, onChange }: SettingsSectionTabsProps) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="inline-flex min-w-full gap-1 rounded-xl border border-zg-border bg-zg-surface-elevated/80 p-1 backdrop-blur-sm sm:min-w-0">
        {SETTINGS_SECTION_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-200 ease-out",
              tab.id === value
                ? "bg-gradient-to-br from-[#7c5cff] to-[#6366f1] text-white shadow-[0_0_24px_-8px_rgba(124,92,255,0.55)]"
                : "text-zg-text-muted hover:bg-white/5 hover:text-zg-fg",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
