import type { SupabaseClient } from "@supabase/supabase-js";
import { applyStructureTemplate } from "@/src/lib/public-page/conversion";
import type { PageBlockId, PublicPageEditorConfig } from "@/src/lib/public-page/editor-config";
import {
  PAGE_SECTION_TYPES,
  type PageSectionContentV1,
  type PageSectionType,
  type RestaurantPageSectionRow,
} from "@/src/lib/public-page/page-sections";
import {
  blockIdToSectionType,
  getSectionMeta,
  listSortableSectionTypes,
  sectionTypeToBlockId,
} from "@/src/lib/public-page/section-registry";
import type { SectionLayoutVariantsMap } from "@/src/lib/themes/sections/types";
import { resolveSectionLayoutVariant } from "@/src/lib/themes/sections/registry";
import type { ThemeId } from "@/src/lib/themes/types";

export type PageSectionLayoutItem = {
  sectionType: PageSectionType;
  sortIndex: number;
  enabled: boolean;
  layoutVariant?: string | null;
};

export type PageSectionDbRow = {
  section_type: string;
  sort_index: number;
  enabled: boolean;
  layout_variant?: string | null;
  data: Record<string, unknown>;
};

const NAV_SORT = 0;
const HERO_SORT = 10;
const SORT_STEP = 10;

/** Ordre canonique par défaut (aligné sur premium_experience). */
const DEFAULT_TYPE_ORDER: PageSectionType[] = [
  "navigation",
  "hero",
  "concept",
  "highlights",
  "gallery",
  "menu_offers",
  "menu_documents",
  "reservation_shell",
  "reviews",
  "gift_vouchers",
  "final_cta",
  "practical",
];

function defaultSortIndex(type: PageSectionType, order: PageSectionType[]): number {
  if (type === "navigation") return NAV_SORT;
  if (type === "hero") return HERO_SORT;
  const idx = order.indexOf(type);
  return idx < 0 ? 900 + order.length : HERO_SORT + idx * SORT_STEP;
}

function templateToSectionOrder(template: PublicPageEditorConfig["conversion"]["structureTemplate"]): PageSectionType[] {
  const blockOrder = applyStructureTemplate(template);
  const types: PageSectionType[] = ["navigation", "hero"];
  for (const blockId of blockOrder) {
    const t = blockIdToSectionType(blockId);
    if (t && !types.includes(t)) types.push(t);
  }
  for (const t of DEFAULT_TYPE_ORDER) {
    if (!types.includes(t)) types.push(t);
  }
  return types;
}

function buildFromEditorConfig(config: PublicPageEditorConfig): PageSectionLayoutItem[] {
  const typeOrder = templateToSectionOrder(config.conversion.structureTemplate);
  const blockEnabled = (id: PageBlockId) => config.blocks[id]?.enabled !== false;

  return PAGE_SECTION_TYPES.map((type) => {
    const meta = getSectionMeta(type);
    const blockId = sectionTypeToBlockId(type);
    let enabled = meta.defaultEnabled;
    if (meta.required) enabled = true;
    else if (blockId) enabled = blockEnabled(blockId);

    return {
      sectionType: type,
      sortIndex: defaultSortIndex(type, typeOrder),
      enabled,
      layoutVariant: null,
    };
  }).sort((a, b) => a.sortIndex - b.sortIndex);
}

function buildFromDbRows(rows: PageSectionDbRow[], fallback: PageSectionLayoutItem[]): PageSectionLayoutItem[] {
  const byType = new Map(rows.map((r) => [r.section_type as PageSectionType, r]));
  const fallbackByType = new Map(fallback.map((i) => [i.sectionType, i]));

  return PAGE_SECTION_TYPES.map((type) => {
    const row = byType.get(type);
    const fb = fallbackByType.get(type);
    const meta = getSectionMeta(type);
    return {
      sectionType: type,
      sortIndex: row?.sort_index ?? fb?.sortIndex ?? defaultSortIndex(type, DEFAULT_TYPE_ORDER),
      enabled: row?.enabled ?? fb?.enabled ?? meta.defaultEnabled,
      layoutVariant: row?.layout_variant ?? fb?.layoutVariant ?? null,
    };
  }).sort((a, b) => a.sortIndex - b.sortIndex);
}

/** Résout la structure : DB prioritaire si au moins une ligne structurelle existe. */
export function resolvePageSectionStructure(
  dbRows: PageSectionDbRow[],
  editorConfig: PublicPageEditorConfig,
): PageSectionLayoutItem[] {
  const fromEditor = buildFromEditorConfig(editorConfig);
  if (dbRows.length === 0) return fromEditor;

  const hasStructure = dbRows.some((r) => PAGE_SECTION_TYPES.includes(r.section_type as PageSectionType));
  if (!hasStructure) return fromEditor;

  return buildFromDbRows(dbRows, fromEditor);
}

/** Sections visibles dans l’éditeur drag & drop (hors navigation fixe). */
export function sortableLayoutItems(structure: PageSectionLayoutItem[]): PageSectionLayoutItem[] {
  const sortable = new Set(listSortableSectionTypes());
  return structure.filter((i) => sortable.has(i.sectionType)).sort((a, b) => a.sortIndex - b.sortIndex);
}

export function navigationLayoutItem(structure: PageSectionLayoutItem[]): PageSectionLayoutItem | undefined {
  return structure.find((i) => i.sectionType === "navigation");
}

export function reindexSortableItems(items: PageSectionLayoutItem[]): PageSectionLayoutItem[] {
  let cursor = HERO_SORT;
  return items.map((item) => {
    if (item.sectionType === "navigation") return { ...item, sortIndex: NAV_SORT };
    if (item.sectionType === "hero") return { ...item, sortIndex: HERO_SORT };
    cursor += SORT_STEP;
    return { ...item, sortIndex: cursor };
  });
}

export function mergeStructureUpdate(
  full: PageSectionLayoutItem[],
  sortableUpdated: PageSectionLayoutItem[],
): PageSectionLayoutItem[] {
  const byType = new Map(sortableUpdated.map((i) => [i.sectionType, i]));
  const reindexed = reindexSortableItems(
    sortableLayoutItems(full).map((i) => byType.get(i.sectionType) ?? i),
  );
  const nav = full.find((i) => i.sectionType === "navigation");
  return [
    ...(nav ? [{ ...nav, sortIndex: NAV_SORT, enabled: true }] : []),
    ...reindexed,
  ].sort((a, b) => a.sortIndex - b.sortIndex);
}

/** Applique structure → ordre legacy + blocs activés (aperçu / default theme). */
export function structureToEditorCompat(
  structure: PageSectionLayoutItem[],
  config: PublicPageEditorConfig,
): Pick<PublicPageEditorConfig, "sectionOrder" | "blocks"> {
  const enabledTypes = structure.filter((i) => i.enabled).sort((a, b) => a.sortIndex - b.sortIndex);
  const sectionOrder: PageBlockId[] = [];
  const seen = new Set<PageBlockId>();

  for (const item of enabledTypes) {
    const blockId = sectionTypeToBlockId(item.sectionType);
    if (!blockId || seen.has(blockId)) continue;
    seen.add(blockId);
    sectionOrder.push(blockId);
  }

  const templateOrder = applyStructureTemplate(config.conversion.structureTemplate);
  for (const id of templateOrder) {
    if (!seen.has(id)) sectionOrder.push(id);
  }

  const blocks = { ...config.blocks };
  for (const item of structure) {
    const blockId = sectionTypeToBlockId(item.sectionType);
    if (!blockId || !blocks[blockId]) continue;
    blocks[blockId] = { ...blocks[blockId], enabled: item.enabled };
  }

  if (structure.find((i) => i.sectionType === "practical" && i.enabled)) {
    if (blocks.hours) blocks.hours = { ...blocks.hours, enabled: true };
    if (blocks.location) blocks.location = { ...blocks.location, enabled: true };
  }

  return { sectionOrder, blocks };
}

export function applyStructureToEditorConfig(
  config: PublicPageEditorConfig,
  structure: PageSectionLayoutItem[],
): PublicPageEditorConfig {
  const patch = structureToEditorCompat(structure, config);
  return { ...config, ...patch, blocks: patch.blocks };
}

function sectionDataForSync(
  type: PageSectionType,
  content: PageSectionContentV1 | undefined,
): Record<string, unknown> {
  const key = type as keyof PageSectionContentV1;
  const slice = content?.[key];
  if (slice && typeof slice === "object" && !Array.isArray(slice)) {
    return slice as Record<string, unknown>;
  }
  return {};
}

/** Upsert structure + contenu éditorial (overlay) en une passe. */
export async function syncRestaurantPageSectionsFull(
  supabase: SupabaseClient,
  restaurantId: string,
  structure: PageSectionLayoutItem[],
  contentOverlay: PageSectionContentV1 | undefined,
): Promise<{ error: string | null }> {
  const rows: (Omit<RestaurantPageSectionRow, "restaurant_id"> & {
    restaurant_id: string;
    layout_variant?: string | null;
  })[] = structure.map((item) => ({
    restaurant_id: restaurantId,
    section_type: item.sectionType,
    sort_index: item.sortIndex,
    enabled: item.enabled,
    layout_variant: item.layoutVariant ?? null,
    data: sectionDataForSync(item.sectionType, contentOverlay),
  }));

  if (rows.length === 0) return { error: null };

  const { error } = await supabase.from("restaurant_page_sections").upsert(rows, {
    onConflict: "restaurant_id,section_type",
  });
  return { error: error?.message ?? null };
}

/** Variantes résolues par type de section pour le rendu public. */
export function sectionLayoutVariantsMap(
  themeId: ThemeId,
  structure: PageSectionLayoutItem[],
): SectionLayoutVariantsMap {
  const out: SectionLayoutVariantsMap = {};
  for (const item of structure) {
    if (!item.enabled) continue;
    const resolved = resolveSectionLayoutVariant(themeId, item.sectionType, item.layoutVariant);
    if (resolved) out[item.sectionType] = resolved;
  }
  return out;
}
