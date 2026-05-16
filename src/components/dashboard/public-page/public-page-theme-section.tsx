"use client";

import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import ThemeCard from "@/src/components/dashboard/public-page/theme-card";
import { useCallback, useMemo, useState } from "react";
import Button from "@/src/components/ui/button";
import Input from "@/src/components/ui/input";
import { listThemes } from "@/src/lib/themes/registry";
import type { ThemeColorOverrides, ThemeId } from "@/src/lib/themes/types";

type PublicPageThemeSectionProps = {
  publicUrl: string;
  selectedId: ThemeId;
  onSelect: (id: ThemeId) => void;
  overrides: ThemeColorOverrides;
  onOverridesChange: (next: ThemeColorOverrides) => void;
};

function hexOrEmpty(v: string | undefined): string {
  return v && /^#[0-9a-fA-F]{6}$/.test(v) ? v : "";
}

export default function PublicPageThemeSection({
  publicUrl,
  selectedId,
  onSelect,
  overrides,
  onOverridesChange,
}: PublicPageThemeSectionProps) {
  const themes = useMemo(() => listThemes(), []);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const accentVal = hexOrEmpty(overrides.colors?.accent);
  const bgVal = hexOrEmpty(overrides.colors?.bg);

  const setColor = useCallback(
    (key: "accent" | "bg", raw: string) => {
      const trimmed = raw.trim();
      if (trimmed === "") {
        const nextColors = { ...overrides.colors };
        delete nextColors[key];
        const next: ThemeColorOverrides = { ...overrides, colors: nextColors };
        if (!next.colors || Object.keys(next.colors).length === 0) {
          delete next.colors;
        }
        onOverridesChange(Object.keys(next).length ? next : {});
        return;
      }
      if (!/^#[0-9a-fA-F]{6}$/.test(trimmed)) return;
      onOverridesChange({
        ...overrides,
        colors: { ...overrides.colors, [key]: trimmed },
      });
    },
    [onOverridesChange, overrides],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-zg-fg">Thème de la page publique</h3>
          <p className="mt-1 max-w-2xl text-sm text-zg-text-muted">
            Choisissez un rendu premium : la structure (réservation, menu, galerie) ne change pas — seule la présentation
            s’adapte.
          </p>
        </div>
        <a href={publicUrl} target="_blank" rel="noreferrer">
          <Button type="button" variant="secondary" className="min-h-10 w-full gap-2 sm:w-auto">
            <ExternalLink className="h-4 w-4" />
            Aperçu public
          </Button>
        </a>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="rounded-xl border border-zg-border bg-zg-surface-elevated/40">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-zg-fg"
          onClick={() => setAdvancedOpen((v) => !v)}
          aria-expanded={advancedOpen}
        >
          Personnalisation avancée (couleurs)
          {advancedOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
        </button>
        {advancedOpen ? (
          <div className="space-y-4 border-t border-zg-border px-4 py-4">
            <p className="text-xs text-zg-text-muted">
              Surcharges optionnelles pour le thème actif. Laissez vide pour les couleurs d’origine du thème.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-zg-text-muted" htmlFor="theme-override-accent">
                  Accent
                </label>
                <div className="flex gap-2">
                  <Input
                    id="theme-override-accent"
                    value={accentVal}
                    onChange={(e) => setColor("accent", e.target.value)}
                    placeholder="#D4AF7A"
                    className="min-h-10 flex-1 font-mono text-sm"
                    autoComplete="off"
                  />
                  <input
                    type="color"
                    className="h-10 w-12 cursor-pointer rounded border border-zg-border bg-transparent p-0"
                    aria-label="Choix couleur accent"
                    value={accentVal || "#d4af7a"}
                    onChange={(e) => setColor("accent", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-zg-text-muted" htmlFor="theme-override-bg">
                  Fond
                </label>
                <div className="flex gap-2">
                  <Input
                    id="theme-override-bg"
                    value={bgVal}
                    onChange={(e) => setColor("bg", e.target.value)}
                    placeholder="#0A0A0A"
                    className="min-h-10 flex-1 font-mono text-sm"
                    autoComplete="off"
                  />
                  <input
                    type="color"
                    className="h-10 w-12 cursor-pointer rounded border border-zg-border bg-transparent p-0"
                    aria-label="Choix couleur de fond"
                    value={bgVal || "#0a0a0a"}
                    onChange={(e) => setColor("bg", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
