"use client";

import { useDraggable, useDroppable, DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { Building2, GripVertical, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "@/src/components/ui/badge";
import { PIPELINE_STATUSES, isPipelineStatus } from "@/src/lib/sharpz/prospects-pipeline";
import type { Prospect, ProspectStatus } from "@/src/lib/sharpz/types";
import { cn } from "@/src/lib/utils";

type Props = {
  prospects: Prospect[];
  labels: Record<ProspectStatus, string>;
  dateLocale: string;
  pending: boolean;
  onSelect: (prospect: Prospect) => void;
  onMove: (prospectId: string, status: ProspectStatus) => void;
};

export function ProspectsKanban({ prospects, labels, dateLocale, pending, onSelect, onMove }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(PIPELINE_STATUSES.map((status) => [status, [] as Prospect[]])) as Record<
      ProspectStatus,
      Prospect[]
    >;
    for (const item of prospects) {
      const status = isPipelineStatus(item.status) ? item.status : "to_contact";
      map[status].push(item);
    }
    return map;
  }, [prospects]);

  const activeProspect = activeId ? prospects.find((item) => item.id === activeId) : null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || pending) return;

    let targetStatus: ProspectStatus | null = null;
    if (isPipelineStatus(String(over.id))) {
      targetStatus = over.id as ProspectStatus;
    } else {
      const overProspect = prospects.find((item) => item.id === over.id);
      targetStatus = overProspect && isPipelineStatus(overProspect.status) ? overProspect.status : null;
    }

    const prospectId = String(active.id);
    const current = prospects.find((item) => item.id === prospectId);
    if (!targetStatus || !current || current.status === targetStatus) return;
    onMove(prospectId, targetStatus);
  }

  return (
    <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {PIPELINE_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            label={labels[status]}
            prospects={byStatus[status]}
            dateLocale={dateLocale}
            onSelect={onSelect}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeProspect ? (
          <ProspectCard prospect={activeProspect} dateLocale={dateLocale} dragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  status,
  label,
  prospects,
  dateLocale,
  onSelect,
}: {
  status: ProspectStatus;
  label: string;
  prospects: Prospect[];
  dateLocale: string;
  onSelect: (prospect: Prospect) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[min(100%,240px)] shrink-0 flex-col rounded-2xl border bg-white/[0.015]",
        isOver ? "border-white/20 bg-white/[0.04]" : "border-white/[0.07]",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-3">
        <p className="text-xs font-medium text-zg-fg">{label}</p>
        <span className="text-[11px] tabular-nums text-zg-muted">{prospects.length}</span>
      </div>
      <div className="flex min-h-[320px] flex-col gap-2 p-2">
        {prospects.map((prospect) => (
          <DraggableProspectCard
            key={prospect.id}
            prospect={prospect}
            dateLocale={dateLocale}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

function DraggableProspectCard({
  prospect,
  dateLocale,
  onSelect,
}: {
  prospect: Prospect;
  dateLocale: string;
  onSelect: (prospect: Prospect) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: prospect.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-30")}>
      <ProspectCard
        prospect={prospect}
        dateLocale={dateLocale}
        dragHandleProps={{ ...attributes, ...listeners }}
        onSelect={onSelect}
      />
    </div>
  );
}

function ProspectCard({
  prospect,
  dateLocale,
  dragging = false,
  dragHandleProps,
  onSelect,
}: {
  prospect: Prospect;
  dateLocale: string;
  dragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
  onSelect?: (prospect: Prospect) => void;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border border-white/[0.08] bg-zg-surface-soft p-3 shadow-sm",
        dragging && "rotate-1 border-white/15 shadow-lg",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab text-zg-muted hover:text-zg-fg active:cursor-grabbing"
          {...dragHandleProps}
          aria-label="Déplacer"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onSelect?.(prospect)}>
          <div className="flex items-center gap-2">
            {prospect.type === "individual" ? (
              <UserRound className="h-3.5 w-3.5 shrink-0 text-zg-muted" />
            ) : (
              <Building2 className="h-3.5 w-3.5 shrink-0 text-zg-muted" />
            )}
            <p className="truncate text-sm font-medium text-zg-fg">{prospect.name || prospect.company}</p>
          </div>
          {prospect.name && prospect.company ? (
            <p className="mt-1 truncate text-xs text-zg-muted">{prospect.company}</p>
          ) : null}
          {prospect.email ? <p className="mt-1 truncate text-xs text-zg-text-secondary">{prospect.email}</p> : null}
          {prospect.nextFollowUpAt ? (
            <p className="mt-2 text-[11px] text-zg-muted">
              {new Date(prospect.nextFollowUpAt).toLocaleDateString(dateLocale)}
            </p>
          ) : null}
          {prospect.fitScore != null ? (
            <Badge className="mt-2">{prospect.fitScore}/100</Badge>
          ) : null}
        </button>
      </div>
    </article>
  );
}
