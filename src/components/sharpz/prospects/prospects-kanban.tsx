"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  defaultDropAnimationSideEffects,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import { Building2, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PIPELINE_STATUSES, isFollowUpOverdue, isFollowUpToday, isPipelineStatus } from "@/src/lib/sharpz/prospects-pipeline";
import type { Prospect, ProspectStatus } from "@/src/lib/sharpz/types";
import { cn } from "@/src/lib/utils";

const dropAnimation: DropAnimation = {
  duration: 180,
  easing: "cubic-bezier(0.2, 0, 0, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.35" } },
  }),
};

type Labels = {
  company: string;
  individual: string;
  lastContact: string;
  fit: string;
  dueToday: string;
  overdue: string;
};

type Props = {
  prospects: Prospect[];
  statusLabels: Record<ProspectStatus, string>;
  copy: Labels;
  dateLocale: string;
  onSelect: (prospect: Prospect) => void;
  onMove: (prospectId: string, status: ProspectStatus) => void;
};

export function ProspectsKanban({ prospects, statusLabels, copy, dateLocale, onSelect, onMove }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

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
    if (!over) return;

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]">
        {PIPELINE_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            label={statusLabels[status]}
            prospects={byStatus[status]}
            copy={copy}
            dateLocale={dateLocale}
            onSelect={onSelect}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={dropAnimation}>
        {activeProspect ? (
          <ProspectCard prospect={activeProspect} copy={copy} dateLocale={dateLocale} lifting />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  status,
  label,
  prospects,
  copy,
  dateLocale,
  onSelect,
}: {
  status: ProspectStatus;
  label: string;
  prospects: Prospect[];
  copy: Labels;
  dateLocale: string;
  onSelect: (prospect: Prospect) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-[260px] shrink-0 flex-col rounded-2xl border transition-colors duration-200",
        isOver ? "border-[#cbb4dc]/35 bg-[#cbb4dc]/[0.06]" : "border-white/[0.06] bg-white/[0.018]",
      )}
    >
      <header className="flex items-center justify-between gap-2 px-3.5 py-3">
        <p className="text-[12px] font-medium tracking-wide text-zg-fg">{label}</p>
        <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[11px] tabular-nums text-zg-muted">
          {prospects.length}
        </span>
      </header>
      <div className="flex min-h-[360px] flex-col gap-2 px-2 pb-3">
        {prospects.map((prospect) => (
          <DraggableProspectCard
            key={prospect.id}
            prospect={prospect}
            copy={copy}
            dateLocale={dateLocale}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

function DraggableProspectCard({
  prospect,
  copy,
  dateLocale,
  onSelect,
}: {
  prospect: Prospect;
  copy: Labels;
  dateLocale: string;
  onSelect: (prospect: Prospect) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: prospect.id });
  const didDrag = useRef(false);

  useEffect(() => {
    if (isDragging) didDrag.current = true;
  }, [isDragging]);

  return (
    <div
      ref={setNodeRef}
      className={cn(isDragging && "opacity-30")}
      {...attributes}
      {...listeners}
    >
      <ProspectCard
        prospect={prospect}
        copy={copy}
        dateLocale={dateLocale}
        onSelect={() => {
          if (didDrag.current) {
            didDrag.current = false;
            return;
          }
          onSelect(prospect);
        }}
      />
    </div>
  );
}

export function ProspectCard({
  prospect,
  copy,
  dateLocale,
  lifting = false,
  onSelect,
}: {
  prospect: Prospect;
  copy: Labels;
  dateLocale: string;
  lifting?: boolean;
  onSelect?: (prospect: Prospect) => void;
}) {
  const title = prospect.name?.trim() || prospect.company;
  const due = isFollowUpToday(prospect.nextFollowUpAt);
  const overdue = isFollowUpOverdue(prospect.nextFollowUpAt);
  const lastContact = prospect.contactedAt
    ? new Date(prospect.contactedAt).toLocaleDateString(dateLocale, { day: "numeric", month: "short" })
    : prospect.lastAction;

  return (
    <article
      className={cn(
        "cursor-grab rounded-xl border border-white/[0.07] bg-[#121018] p-3 text-left shadow-[0_8px_24px_-18px_rgba(0,0,0,0.9)] transition-[border-color,transform,box-shadow] duration-200",
        "hover:border-white/[0.12]",
        lifting && "cursor-grabbing rotate-[1.4deg] scale-[1.04] border-white/16 shadow-[0_28px_50px_-18px_rgba(0,0,0,0.85)]",
      )}
      onClick={() => onSelect?.(prospect)}
    >
      <p className="truncate text-[13px] font-medium leading-snug text-zg-fg">{title}</p>
      <p className="mt-1 text-[11px] text-zg-muted">
        {prospect.type === "individual" ? copy.individual : copy.company}
      </p>
      {prospect.contact || (prospect.name && prospect.company) ? (
        <p className="mt-1.5 truncate text-[12px] text-zg-text-secondary">
          {prospect.contact || prospect.company}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {lastContact ? (
          <span className="text-[10px] text-zg-muted">
            {copy.lastContact} {lastContact}
          </span>
        ) : null}
        {prospect.nextFollowUpAt ? (
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px]",
              overdue ? "bg-white/[0.06] text-zg-warning" : due ? "bg-white/[0.06] text-zg-fg" : "text-zg-muted",
            )}
          >
            {overdue ? copy.overdue : due ? copy.dueToday : new Date(prospect.nextFollowUpAt).toLocaleDateString(dateLocale, { day: "numeric", month: "short" })}
          </span>
        ) : null}
        {prospect.fitScore != null ? (
          <span className="ml-auto text-[10px] tabular-nums text-zg-text-secondary">
            {copy.fit} {prospect.fitScore}
          </span>
        ) : null}
      </div>
    </article>
  );
}

export function ProspectTypeIcon({ type }: { type: Prospect["type"] }) {
  return type === "individual" ? (
    <UserRound className="h-3.5 w-3.5 text-zg-muted" />
  ) : (
    <Building2 className="h-3.5 w-3.5 text-zg-muted" />
  );
}
