"use client";

import { useMemo } from "react";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import type { FontCatalogEntry, FontRole } from "@/src/lib/themes/fonts/catalog";
import { getThemeFontCatalog, getThemeFontDefaults } from "@/src/lib/themes/fonts/registry";
import type { ThemeId, ThemeOverrides } from "@/src/lib/themes/types";

const ROLE_LABELS: Record<FontRole, { title: string; hint: string }> = {
  display: {
    title: "Titres",
    hint: "Titres principaux et accroches éditoriales.",
  },
  body: {
    title: "Texte",
    hint: "Paragraphes, formulaires et libellés.",
  },
  script: {
    title: "Accent script",
    hint: "Lignes décoratives type « Discover » ou signature.",
  },
};

const FONT_ROLES: FontRole[] = ["display", "body", "script"];

type ThemeFontPickersProps = {
  themeId: ThemeId;
  overrides: ThemeOverrides;
  onOverridesChange: (next: ThemeOverrides) => void;
};

export default function ThemeFontPickers({ themeId, overrides, onOverridesChange }: ThemeFontPickersProps) {
  const catalog = useMemo(() => getThemeFontCatalog(themeId), [themeId]);
  const defaults = useMemo(() => getThemeFontDefaults(themeId), [themeId]);

  const setFont = (role: FontRole, key: string) => {
    const nextFonts = { ...overrides.fonts };
    if (key === defaults[role]) {
      delete nextFonts[role];
    } else {
      nextFonts[role] = key;
    }
    const next: ThemeOverrides = { ...overrides };
    if (Object.keys(nextFonts).length) next.fonts = nextFonts;
    else delete next.fonts;
    onOverridesChange(Object.keys(next.colors ?? {}).length || next.fonts ? next : {});
  };

  const resetFonts = () => {
    const next: ThemeOverrides = { ...overrides };
    delete next.fonts;
    onOverridesChange(Object.keys(next.colors ?? {}).length ? next : {});
  };

  const hasFontOverrides = Boolean(overrides.fonts && Object.keys(overrides.fonts).length > 0);

  return (
    <div className="space-y-4">
      <FontsToolbar hasFontOverrides={hasFontOverrides} onResetFonts={resetFonts} />

      <div className="grid gap-4 sm:grid-cols-3">
        {FONT_ROLES.map((role) => (
          <FontRoleColumn
            key={role}
            role={role}
            options={catalog[role]}
            selectedKey={overrides.fonts?.[role] ?? defaults[role]}
            defaultKey={defaults[role]}
            onSelect={(key) => setFont(role, key)}
          />
        ))}
      </div>
    </div>
  );
}

function FontsToolbar({
  hasFontOverrides,
  onResetFonts,
}: {
  hasFontOverrides: boolean;
  onResetFonts: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs text-zg-text-muted">
        Polices compatibles avec le thème sélectionné — pas de polices hors catalogue.
      </p>
      {hasFontOverrides ? (
        <Button type="button" variant="secondary" className="min-h-9 text-xs" onClick={onResetFonts}>
          Réinitialiser les polices
        </Button>
      ) : null}
    </div>
  );
}

function FontRoleColumn({
  role,
  options,
  selectedKey,
  defaultKey,
  onSelect,
}: {
  role: FontRole;
  options: FontCatalogEntry[];
  selectedKey: string;
  defaultKey: string;
  onSelect: (key: string) => void;
}) {
  const { title, hint } = ROLE_LABELS[role];
  return (
    <div className="space-y-2">
      <FontRoleHeader title={title} hint={hint} />
      <div className="flex flex-col gap-1.5">
        {options.map((opt) => {
          const selected = selectedKey === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onSelect(opt.key)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left transition-all",
                selected
                  ? "border-zg-accent bg-zg-accent/10 ring-1 ring-zg-accent"
                  : "border-zg-border bg-zg-surface hover:border-zg-accent/40",
              )}
              style={{ fontFamily: `var(${opt.cssVar}, ${opt.googleFamily}, ${opt.stack})` }}
            >
              <span className="block text-sm font-semibold text-zg-fg">{opt.name}</span>
              <span className="mt-0.5 block text-[11px] text-zg-text-muted">
                {selected && opt.key === defaultKey ? "Défaut du thème" : null}
                {selected && opt.key !== defaultKey ? "Sélectionné" : null}
                {!selected ? "Choisir" : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FontRoleHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-zg-text-muted">{title}</p>
      <p className="text-[11px] text-zg-text-muted">{hint}</p>
    </div>
  );
}
