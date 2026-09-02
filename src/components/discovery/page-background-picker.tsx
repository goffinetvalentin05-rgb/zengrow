"use client";

import { useState } from "react";
import {
  PAGE_BACKGROUND_PRESET_KEYS,
  PAGE_BACKGROUND_SOLID_KEYS,
  isPageBackgroundKey,
  pageBackgroundPreviewStyle,
  type PageBackgroundKey,
} from "@/src/lib/discovery/appearance";
import { PageBackgroundUpload } from "@/src/components/discovery/page-background-upload";
import { cn } from "@/src/lib/utils";
import { useI18n } from "@/src/i18n/provider";

export function PageBackgroundPicker({
  userId,
  value,
  imageUrl,
  onSaved,
}: {
  userId: string;
  value: string;
  imageUrl: string | null;
  onSaved: () => void;
}) {
  const { t } = useI18n();
  const [current, setCurrent] = useState<PageBackgroundKey>(isPageBackgroundKey(value) ? value : "void");

  async function select(key: PageBackgroundKey) {
    const previous = current;
    setCurrent(key);
    const response = await fetch("/api/discovery/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageBackgroundKey: key }),
    });
    if (!response.ok) {
      setCurrent(previous);
      return;
    }
    onSaved();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">{t.editor.pageBgColor}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PAGE_BACKGROUND_SOLID_KEYS.map((key) => (
            <BackgroundChoice key={key} active={current === key} bgKey={key} onSelect={() => void select(key)} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">{t.editor.pageBgPresets}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PAGE_BACKGROUND_PRESET_KEYS.map((key) => (
            <BackgroundChoice key={key} active={current === key} bgKey={key} onSelect={() => void select(key)} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.14em] text-white/40">{t.editor.pageBgCustom}</p>
        {imageUrl ? (
          <p className="mb-3 text-xs text-white/40">{t.editor.pageBgCustomHint}</p>
        ) : null}
        <PageBackgroundUpload userId={userId} currentUrl={imageUrl} />
      </div>
    </div>
  );
}

function BackgroundChoice({
  bgKey,
  active,
  onSelect,
}: {
  bgKey: PageBackgroundKey;
  active: boolean;
  onSelect: () => void;
}) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "overflow-hidden rounded-2xl text-left ring-1 transition",
        active ? "ring-white/30" : "ring-white/[0.07] hover:ring-white/16",
      )}
    >
      <span className="block h-14 w-full" style={pageBackgroundPreviewStyle(bgKey)} />
      <span className={cn("block px-3 py-2 text-sm", active ? "bg-white/[0.08] text-white" : "bg-white/[0.03] text-white/70")}>
        {t.pageBg[bgKey]}
      </span>
    </button>
  );
}
