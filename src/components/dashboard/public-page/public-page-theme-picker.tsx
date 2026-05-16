"use client";

import { ExternalLink, RotateCcw } from "lucide-react";
import { useMemo } from "react";
import ThemeCard from "@/src/components/dashboard/public-page/theme-card";
import Button from "@/src/components/ui/button";
import { listThemes } from "@/src/lib/themes/registry";
import type { ThemeId, ThemeOverrides } from "@/src/lib/themes/types";

type PublicPageThemePickerProps = {
  publicUrl: string;
  selectedId: ThemeId;
  onSelect: (id: ThemeId) => void;
  overrides: ThemeOverrides;
  onResetOverrides: () => void;
};

function hasAnyOverrides(overrides: ThemeOverrides): boolean {
  return Boolean(
    (overrides.colors && Object.keys(overrides.colors).length > 0) ||
      (overrides.fonts && Object.keys(overrides.fonts).length > 0),
  );
}

export default function PublicPageThemePicker({
  publicUrl,
  selectedId,
  onSelect,
  overrides,
  onResetOverrides,
}: PublicPageThemePickerProps) {
  const themes = useMemo(() => listThemes(), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-2xl text-sm text-zg-text-muted">
          La structure de la page (réservation, menu, galerie) reste identique — seul le rendu visuel change.
        </p>
        <a href={publicUrl} target="_blank" rel="noreferrer">
          <Button type="button" variant="secondary" className="min-h-10 w-full gap-2 sm:w-auto">
            <ExternalLink className="h-4 w-4" />
            Aperçu public
          </Button>
        </a>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((t) => (
          <ThemeCard
            key={t.id}
            name={t.name}
            description={t.description}
            previewImage={t.previewImage}
            selected={selectedId === t.id}
            onSelect={() => onSelect(t.id)}
          />
        ))}
      </div>

      {hasAnyOverrides(overrides) ? (
        <div className="flex justify-end">
          <Button type="button" variant="secondary" className="mt-4 min-h-9 gap-2 text-xs" onClick={onResetOverrides}>
            <RotateCcw className="h-3.5 w-3.5" />
            Revenir au préréglage du thème
          </Button>
        </div>
      ) : null}
    </div>
  );
}
