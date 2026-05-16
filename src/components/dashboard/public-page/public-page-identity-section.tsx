"use client";

import { useCallback, useMemo } from "react";
import { cn } from "@/src/lib/utils";
import ThemeFontPickers from "@/src/components/dashboard/public-page/theme-font-pickers";
import Input from "@/src/components/ui/input";
import {
  presetsWithAccessibility,
  resolvePageBackgroundHex,
} from "@/src/lib/themes/colors/accent-presets";
import { contrastButtonText, evaluateAccentAccessibility } from "@/src/lib/themes/colors/contrast";
import PublicPageLogoField from "@/src/components/dashboard/public-page/public-page-logo-field";
import type { ThemeId, ThemeOverrides } from "@/src/lib/themes/types";
import type { ChangeEvent } from "react";

type PublicPageIdentitySectionProps = {
  themeId: ThemeId;
  overrides: ThemeOverrides;
  onOverridesChange: (next: ThemeOverrides) => void;
  /** Thème classique : couleur CTA stockée hors theme_overrides. */
  legacyAccentColor?: string;
  onLegacyAccentChange?: (hex: string) => void;
  logoUrl?: string;
  isUploadingLogo?: boolean;
  onLogoUpload?: (event: ChangeEvent<HTMLInputElement>) => void;
  onLogoRemove?: () => void;
};

function hexOrEmpty(v: string | undefined): string {
  return v && /^#[0-9a-fA-F]{6}$/.test(v) ? v : "";
}

export default function PublicPageIdentitySection({
  themeId,
  overrides,
  onOverridesChange,
  legacyAccentColor,
  onLegacyAccentChange,
  logoUrl = "",
  isUploadingLogo = false,
  onLogoUpload,
  onLogoRemove,
}: PublicPageIdentitySectionProps) {
  const isPremium = themeId !== "default";
  const pageBg = resolvePageBackgroundHex(themeId, overrides.colors?.bg);
  const accentHex = isPremium
    ? hexOrEmpty(overrides.colors?.accent) || presetsWithAccessibility(themeId, pageBg)[0]?.hex
    : legacyAccentColor ?? "#1F7A6C";

  const presets = useMemo(() => presetsWithAccessibility(themeId, pageBg), [themeId, pageBg]);

  const setAccent = useCallback(
    (hex: string) => {
      if (isPremium) {
        onOverridesChange({
          ...overrides,
          colors: { ...overrides.colors, accent: hex },
        });
      } else {
        onLegacyAccentChange?.(hex);
      }
    },
    [isPremium, onLegacyAccentChange, onOverridesChange, overrides],
  );

  const setColorOverride = useCallback(
    (key: "accent" | "bg", raw: string) => {
      const trimmed = raw.trim();
      if (trimmed === "") {
        const nextColors = { ...overrides.colors };
        delete nextColors[key];
        const next: ThemeOverrides = { ...overrides, colors: nextColors };
        if (!next.colors || Object.keys(next.colors).length === 0) delete next.colors;
        onOverridesChange(
          Object.keys(next).length === 0 || (next.colors && Object.keys(next.colors).length === 0 && !next.fonts)
            ? { ...(next.fonts ? { fonts: next.fonts } : {}) }
            : next,
        );
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

  const activeReport =
    presets.find((p) => p.hex.toLowerCase() === accentHex.toLowerCase())?.report ??
    evaluateAccentAccessibility(accentHex, pageBg);
  const customAccessible = activeReport.accentOnBgPassesUi && activeReport.buttonLabelPasses;

  return (
    <div className="space-y-6">
      {onLogoUpload && onLogoRemove ? (
        <PublicPageLogoField
          logoUrl={logoUrl}
          isUploading={isUploadingLogo}
          onUpload={onLogoUpload}
          onRemove={onLogoRemove}
        />
      ) : null}

      <div>
        <h4 className="text-sm font-semibold text-zg-fg">Typographie</h4>
        <p className="mt-1 text-xs text-zg-text-muted">
          Trois rôles de police — sélection curatée selon le thème actif.
        </p>
        <div className="mt-4">
          <ThemeFontPickers themeId={themeId} overrides={overrides} onOverridesChange={onOverridesChange} />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-zg-fg">Couleur d&apos;accent</h4>
        <p className="mt-1 text-xs text-zg-text-muted">
          Presets testés pour la lisibilité sur le fond de page et sur les boutons (WCAG).
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {presets.map((preset) => {
            const selected = accentHex.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => setAccent(preset.hex)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                  selected
                    ? "border-zg-accent bg-zg-accent/10 ring-1 ring-zg-accent"
                    : "border-zg-border bg-zg-surface hover:border-zg-accent/40",
                  !preset.recommended && "opacity-80",
                )}
              >
                <span
                  className="mt-0.5 h-9 w-9 shrink-0 rounded-lg border border-zg-border/80"
                  style={{ backgroundColor: preset.hex }}
                  aria-hidden
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-zg-fg">{preset.label}</span>
                  {preset.description ? (
                    <span className="mt-0.5 block text-[11px] text-zg-text-muted">{preset.description}</span>
                  ) : null}
                  <span
                    className={cn(
                      "mt-1 inline-block text-[10px] font-medium uppercase tracking-wide",
                      preset.recommended ? "text-emerald-700" : "text-amber-700",
                    )}
                  >
                    {preset.recommended ? "Contraste OK" : "Contraste faible"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div
          className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-zg-border bg-zg-surface-elevated/50 p-4"
          style={{ backgroundColor: pageBg }}
        >
          <div className="min-w-[140px] flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zg-text-muted">Aperçu live</p>
            <p className="mt-2 text-lg font-medium" style={{ color: accentHex }}>
              Lien &amp; surtitre
            </p>
            <button
              type="button"
              className="mt-3 rounded-[var(--zg-radius-pill,999px)] px-5 py-2 text-xs font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: accentHex,
                color: contrastButtonText(accentHex),
              }}
            >
              Réserver
            </button>
          </div>
          {isPremium || onLegacyAccentChange ? (
            <div className="flex min-w-[200px] flex-1 flex-col gap-2">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-zg-text-muted" htmlFor="identity-accent-hex">
                {isPremium ? "Hex personnalisé" : "Couleur du bouton"}
              </label>
              <div className="flex gap-2">
                <Input
                  id="identity-accent-hex"
                  value={isPremium ? hexOrEmpty(overrides.colors?.accent) : accentHex}
                  onChange={(e) =>
                    isPremium ? setColorOverride("accent", e.target.value) : onLegacyAccentChange?.(e.target.value)
                  }
                  placeholder={presets[0]?.hex}
                  className="min-h-9 flex-1 font-mono text-sm"
                  autoComplete="off"
                />
                <input
                  type="color"
                  className="h-9 w-11 cursor-pointer rounded border border-zg-border bg-transparent p-0"
                  aria-label="Nuancier accent"
                  value={(isPremium ? hexOrEmpty(overrides.colors?.accent) : legacyAccentColor) || accentHex}
                  onChange={(e) =>
                    isPremium ? setColorOverride("accent", e.target.value) : onLegacyAccentChange?.(e.target.value)
                  }
                />
              </div>
              {!customAccessible ? (
                <p className="text-[11px] text-amber-800">
                  Contraste insuffisant sur ce fond — privilégiez un preset recommandé.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {isPremium ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-zg-text-muted" htmlFor="identity-bg-hex">
                Fond de page (optionnel)
              </label>
              <div className="mt-1 flex gap-2">
                <Input
                  id="identity-bg-hex"
                  value={hexOrEmpty(overrides.colors?.bg)}
                  onChange={(e) => setColorOverride("bg", e.target.value)}
                  placeholder={pageBg}
                  className="mt-1 min-h-9 font-mono text-sm"
                  autoComplete="off"
                />
                <input
                  type="color"
                  className="h-9 w-11 shrink-0 cursor-pointer rounded border border-zg-border bg-transparent p-0"
                  aria-label="Nuancier fond"
                  value={hexOrEmpty(overrides.colors?.bg) || pageBg}
                  onChange={(e) => setColorOverride("bg", e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
