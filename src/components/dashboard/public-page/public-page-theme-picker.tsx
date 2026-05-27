"use client";

import { RotateCcw } from "lucide-react";
import { useMemo } from "react";
import ThemeCard from "@/src/components/dashboard/public-page/theme-card";
import Button from "@/src/components/ui/button";
import { listShowroomThemes } from "@/src/lib/themes/registry";
import type { ThemeId, ThemeOverrides } from "@/src/lib/themes/types";

type PublicPageThemePickerProps = {
  publicUrl: string;
  selectedId: ThemeId;
  onSelect: (id: ThemeId) => void;
  overrides: ThemeOverrides;
  onResetOverrides: () => void;
  onThemeApplied?: (id: ThemeId) => void;
};

function hasAnyOverrides(overrides: ThemeOverrides): boolean {
  return Boolean(
    (overrides.colors && Object.keys(overrides.colors).length > 0) ||
      (overrides.fonts && Object.keys(overrides.fonts).length > 0),
  );
}

export default function PublicPageThemePicker({
  selectedId,
  onSelect,
  overrides,
  onResetOverrides,
  onThemeApplied,
}: PublicPageThemePickerProps) {
  const themes = useMemo(() => listShowroomThemes(), []);

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-zg-text-muted">
        Choisissez l&apos;ambiance de votre page de conversion. Chaque template optimise le parcours mobile vers la réservation.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {themes.map((t) => (
          <ThemeCard
            key={t.id}
            name={t.name}
            description={t.description}
            previewImage={t.previewImage}
            selected={selectedId === t.id}
            onSelect={() => {
              if (selectedId !== t.id) {
                onSelect(t.id);
                onThemeApplied?.(t.id);
              }
            }}
          />
        ))}
      </div>

      {hasAnyOverrides(overrides) ? (
        <div className="flex justify-end">
          <Button type="button" variant="secondary" className="min-h-9 gap-2 text-xs" onClick={onResetOverrides}>
            <RotateCcw className="h-3.5 w-3.5" />
            Revenir au préréglage du thème
          </Button>
        </div>
      ) : null}
    </div>
  );
}
