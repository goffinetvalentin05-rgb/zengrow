import { type FontCatalogEntry, type FontRole, getFontCatalogEntry } from "@/src/lib/themes/fonts/catalog";
import { googleFontsUrlFromEntries } from "@/src/lib/themes/fonts/google-url";
import {
  getThemeFontCatalog,
  getThemeFontDefaults,
  isFontKeyAllowedForTheme,
} from "@/src/lib/themes/fonts/registry";
import type { ThemeFontOverrides, ThemeId } from "@/src/lib/themes/types";
import type { FontTokens } from "@/src/lib/themes/types";

export type ResolvedThemeFonts = {
  keys: Record<FontRole, string>;
  entries: Record<FontRole, FontCatalogEntry>;
  fontTokens: FontTokens;
  /** Définitions `--font-*` pour polices non préchargées. */
  cssVarDefinitions: Record<string, string>;
  googleFontsUrl: string | null;
};

function resolveRoleKey(
  themeId: ThemeId,
  role: FontRole,
  overrides: ThemeFontOverrides | undefined,
): string {
  const raw = overrides?.[role]?.trim();
  if (raw && isFontKeyAllowedForTheme(themeId, role, raw)) return raw;
  return getThemeFontDefaults(themeId)[role];
}

/** Associe un nom Google (legacy) à une clé du catalogue pour le thème. */
export function legacyGoogleFamilyToFontKey(
  themeId: ThemeId,
  role: FontRole,
  googleFamily: string | null | undefined,
): string | null {
  const name = (googleFamily ?? "").trim().toLowerCase();
  if (!name) return null;
  const match = getThemeFontCatalog(themeId)[role].find(
    (e) => e.googleFamily.toLowerCase() === name || e.name.toLowerCase() === name,
  );
  return match?.key ?? null;
}

export function resolveThemeFonts(
  themeId: ThemeId,
  fontOverrides: ThemeFontOverrides | undefined,
): ResolvedThemeFonts {
  const roles: FontRole[] = ["display", "body", "script"];
  const keys = {} as Record<FontRole, string>;
  const entries = {} as Record<FontRole, FontCatalogEntry>;

  for (const role of roles) {
    const key = resolveRoleKey(themeId, role, fontOverrides);
    keys[role] = key;
    const entry = getFontCatalogEntry(key) ?? getFontCatalogEntry(getThemeFontDefaults(themeId)[role])!;
    entries[role] = entry;
  }

  const usedEntries = Object.values(entries);
  const cssVarDefinitions: Record<string, string> = {};
  for (const entry of usedEntries) {
    if (!entry.preloaded) {
      cssVarDefinitions[entry.cssVar] = `'${entry.googleFamily}', ${entry.stack}`;
    }
  }

  const fontTokens: FontTokens = {
    display: `var(${entries.display.cssVar})`,
    body: `var(${entries.body.cssVar})`,
    script: `var(${entries.script.cssVar})`,
  };

  return {
    keys,
    entries,
    fontTokens,
    cssVarDefinitions,
    googleFontsUrl: googleFontsUrlFromEntries(usedEntries),
  };
}

export function resolvedFontFamiliesForPreview(resolved: ResolvedThemeFonts): {
  headingFont: string;
  bodyFont: string;
} {
  return {
    headingFont: resolved.entries.display.googleFamily,
    bodyFont: resolved.entries.body.googleFamily,
  };
}
