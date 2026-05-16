import type { PageSectionType } from "@/src/lib/public-page/page-sections";
import type { ThemeId } from "@/src/lib/themes/types";
import { PREMIUM_DARK_SECTION_VARIANTS } from "@/src/lib/themes/premium-dark/sections/catalog";
import type { SectionVariantOption, ThemeSectionVariantCatalog } from "@/src/lib/themes/sections/types";

const THEME_CATALOGS: Partial<Record<ThemeId, ThemeSectionVariantCatalog>> = {
  "premium-dark": PREMIUM_DARK_SECTION_VARIANTS,
  "premium-elegant": PREMIUM_DARK_SECTION_VARIANTS,
};

export function getThemeSectionVariantCatalog(themeId: ThemeId): ThemeSectionVariantCatalog {
  return THEME_CATALOGS[themeId] ?? {};
}

export function getSectionVariantsForTheme(
  themeId: ThemeId,
  sectionType: PageSectionType,
): SectionVariantOption[] {
  return getThemeSectionVariantCatalog(themeId)[sectionType]?.variants ?? [];
}

export function getDefaultSectionVariant(themeId: ThemeId, sectionType: PageSectionType): string | null {
  return getThemeSectionVariantCatalog(themeId)[sectionType]?.defaultVariant ?? null;
}

export function resolveSectionLayoutVariant(
  themeId: ThemeId,
  sectionType: PageSectionType,
  stored: string | null | undefined,
): string | null {
  const catalog = getThemeSectionVariantCatalog(themeId)[sectionType];
  if (!catalog) return null;
  if (stored && catalog.variants.some((v) => v.id === stored)) return stored;
  return catalog.defaultVariant;
}

export function isValidSectionLayoutVariant(
  themeId: ThemeId,
  sectionType: PageSectionType,
  variantId: string,
): boolean {
  return getSectionVariantsForTheme(themeId, sectionType).some((v) => v.id === variantId);
}

export function conceptLayoutFromVariant(
  variant: string,
): "image-right" | "image-left" | "stacked" {
  if (variant === "image-left") return "image-left";
  if (variant === "stacked") return "stacked";
  return "image-right";
}
