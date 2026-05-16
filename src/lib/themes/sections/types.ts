import type { PageSectionType } from "@/src/lib/public-page/page-sections";
import type { ThemeId } from "@/src/lib/themes/types";

export type SectionVariantOption = {
  id: string;
  label: string;
  description?: string;
};

export type ThemeSectionVariantCatalog = Partial<
  Record<PageSectionType, { defaultVariant: string; variants: SectionVariantOption[] }>
>;

export type SectionLayoutVariantsMap = Partial<Record<PageSectionType, string>>;
