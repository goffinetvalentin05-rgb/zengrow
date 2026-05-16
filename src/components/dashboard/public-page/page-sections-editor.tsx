"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock, Plus } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import Button from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { getSectionMeta, listAddableSectionTypes } from "@/src/lib/public-page/section-registry";
import type { PageSectionLayoutItem } from "@/src/lib/public-page/page-section-structure";
import {
  mergeStructureUpdate,
  sortableLayoutItems,
} from "@/src/lib/public-page/page-section-structure";
import type { PageSectionType } from "@/src/lib/public-page/page-sections";
import { getSectionVariantsForTheme, resolveSectionLayoutVariant } from "@/src/lib/themes/sections/registry";
import type { ThemeId } from "@/src/lib/themes/types";

type PageSectionsEditorProps = {
  themeId: ThemeId;
  structure: PageSectionLayoutItem[];
  onStructureChange: (next: PageSectionLayoutItem[]) => void;
};

function SortableRow({
  item,
  themeId,
  onToggleEnabled,
  onVariantChange,
}: {
  item: PageSectionLayoutItem;
  themeId: ThemeId;
  onToggleEnabled: (type: PageSectionType, enabled: boolean) => void;
  onVariantChange: (type: PageSectionType, variant: string) => void;
}) {
  const meta = getSectionMeta(item.sectionType);
  const canDisable = !meta.required;
  const variantOptions = getSectionVariantsForTheme(themeId, item.sectionType);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.sectionType,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <SortableRowContent
      themeId={themeId}
      setNodeRef={setNodeRef}
      style={style}
      isDragging={isDragging}
      item={item}
      meta={meta}
      canDisable={canDisable}
      variantOptions={variantOptions}
      onToggleEnabled={onToggleEnabled}
      onVariantChange={onVariantChange}
      attributes={attributes}
      listeners={listeners}
    />
  );
}

function SortableRowContent({
  themeId,
  setNodeRef,
  style,
  isDragging,
  item,
  meta,
  canDisable,
  variantOptions,
  onToggleEnabled,
  onVariantChange,
  attributes,
  listeners,
}: {
  themeId: ThemeId;
  setNodeRef: (node: HTMLElement | null) => void;
  style: CSSProperties;
  isDragging: boolean;
  item: PageSectionLayoutItem;
  meta: ReturnType<typeof getSectionMeta>;
  canDisable: boolean;
  variantOptions: ReturnType<typeof getSectionVariantsForTheme>;
  onToggleEnabled: (type: PageSectionType, enabled: boolean) => void;
  onVariantChange: (type: PageSectionType, variant: string) => void;
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
}) {
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex touch-none items-center gap-3 rounded-xl border bg-zg-surface px-3 py-3",
        isDragging ? "z-10 border-zg-accent shadow-md" : "border-zg-border",
        !item.enabled && "opacity-55",
      )}
      {...attributes}
      {...listeners}
      aria-label={`Réordonner ${meta.label}`}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zg-text-muted"
        aria-hidden
      >
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-zg-fg">{meta.label}</p>
        <p className="text-xs text-zg-text-muted">{meta.description}</p>
        {meta.required ? (
          <p className="mt-0.5 text-[11px] font-medium text-zg-accent">Section obligatoire</p>
        ) : null}
        {!item.enabled && !meta.required ? (
          <p className="mt-0.5 text-[11px] text-zg-text-muted">Masquée sur la page publique</p>
        ) : null}
        {variantOptions.length > 0 && item.enabled ? (
          <label className="mt-2 block text-xs text-zg-text-muted">
            <span className="sr-only">Variante de mise en page pour {meta.label}</span>
            <select
              className="mt-1 w-full max-w-[220px] rounded-lg border border-zg-border bg-zg-surface px-2 py-1.5 text-xs font-medium text-zg-fg"
              value={resolveSectionLayoutVariant(themeId, item.sectionType, item.layoutVariant) ?? ""}
              onChange={(e) => onVariantChange(item.sectionType, e.target.value)}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {variantOptions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <label
        className="flex shrink-0 cursor-pointer items-center gap-2 text-xs font-medium text-zg-text-muted"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-zg-border accent-zg-accent"
          checked={item.enabled}
          disabled={!canDisable}
          onChange={(e) => onToggleEnabled(item.sectionType, e.target.checked)}
        />
        {item.enabled ? "Activée" : "Désactivée"}
      </label>
    </div>
  );
}

export default function PageSectionsEditor({ themeId, structure, onStructureChange }: PageSectionsEditorProps) {
  const [addOpen, setAddOpen] = useState(false);
  const sortable = useMemo(() => sortableLayoutItems(structure), [structure]);
  const sortableIds = useMemo(() => sortable.map((i) => i.sectionType), [sortable]);

  const addable = useMemo(() => {
    const enabledTypes = structure.filter((i) => i.enabled).map((i) => i.sectionType);
    return listAddableSectionTypes(enabledTypes);
  }, [structure]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortableIds.indexOf(active.id as PageSectionType);
    const newIndex = sortableIds.indexOf(over.id as PageSectionType);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(sortable, oldIndex, newIndex);
    onStructureChange(mergeStructureUpdate(structure, reordered));
  };

  const handleToggle = (type: PageSectionType, enabled: boolean) => {
    onStructureChange(structure.map((i) => (i.sectionType === type ? { ...i, enabled } : i)));
  };

  const handleVariantChange = (type: PageSectionType, variant: string) => {
    onStructureChange(structure.map((i) => (i.sectionType === type ? { ...i, layoutVariant: variant } : i)));
  };

  const handleAdd = (type: PageSectionType) => {
    const next = structure.map((i) => (i.sectionType === type ? { ...i, enabled: true } : i));
    onStructureChange(mergeStructureUpdate(structure, sortableLayoutItems(next)));
    setAddOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-zg-border/80 bg-zg-surface-elevated/50 px-3 py-2 text-xs text-zg-text-muted">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        La navigation reste fixée en haut de page (non réordonnable).
      </div>

      <p className="text-xs text-zg-text-muted">
        Glissez pour réordonner. Hero et réservation ne peuvent pas être désactivées.
      </p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {sortable.map((item) => (
              <li key={item.sectionType}>
                <SortableRow
                  item={item}
                  themeId={themeId}
                  onToggleEnabled={handleToggle}
                  onVariantChange={handleVariantChange}
                />
              </li>
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {addable.length > 0 ? (
        <div className="relative">
          <Button type="button" variant="secondary" className="min-h-10 gap-2" onClick={() => setAddOpen((v) => !v)}>
            <Plus className="h-4 w-4" />
            Ajouter une section
          </Button>
          {addOpen ? <AddSectionMenu addable={addable} onAdd={handleAdd} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function AddSectionMenu({
  addable,
  onAdd,
}: {
  addable: PageSectionType[];
  onAdd: (type: PageSectionType) => void;
}) {
  return (
    <div className="absolute left-0 top-full z-20 mt-2 w-full min-w-[240px] rounded-xl border border-zg-border bg-zg-surface p-2 shadow-lg sm:w-72">
      {addable.map((type) => {
        const meta = getSectionMeta(type);
        return (
          <button
            key={type}
            type="button"
            className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-zg-border/40"
            onClick={() => onAdd(type)}
          >
            <span className="text-sm font-semibold text-zg-fg">{meta.label}</span>
            <span className="text-xs text-zg-text-muted">{meta.description}</span>
          </button>
        );
      })}
    </div>
  );
}
