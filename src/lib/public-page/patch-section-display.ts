import type { PublicPageEditorConfig } from "@/src/lib/public-page/editor-config";
import { mergePageSectionContent, type PageSectionContentV1 } from "@/src/lib/public-page/page-sections";
import type {
  HeroSectionDisplay,
  PracticalSectionDisplay,
} from "@/src/lib/public-page/section-display";

function patchDisplay<
  K extends keyof PageSectionContentV1,
  D extends Record<string, boolean>,
>(
  config: PublicPageEditorConfig,
  sectionKey: K,
  displayKey: keyof D & string,
  value: boolean,
): PublicPageEditorConfig {
  const slice = config.pageSections?.[sectionKey];
  const prevDisplay =
    slice && typeof slice === "object" && "display" in slice
      ? (slice.display as Partial<D>)
      : undefined;
  return {
    ...config,
    pageSections: mergePageSectionContent(config.pageSections ?? {}, {
      [sectionKey]: {
        ...(slice && typeof slice === "object" ? slice : {}),
        display: { ...prevDisplay, [displayKey]: value },
      },
    } as PageSectionContentV1),
  };
}

export function patchPracticalDisplay(
  config: PublicPageEditorConfig,
  displayKey: keyof PracticalSectionDisplay,
  value: boolean,
): PublicPageEditorConfig {
  return patchDisplay(config, "practical", displayKey, value);
}

export function patchHeroDisplay(
  config: PublicPageEditorConfig,
  displayKey: keyof HeroSectionDisplay,
  value: boolean,
): PublicPageEditorConfig {
  return patchDisplay(config, "hero", displayKey, value);
}
