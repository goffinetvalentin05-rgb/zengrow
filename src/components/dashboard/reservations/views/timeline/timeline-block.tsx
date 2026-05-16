"use client";

import {
  TIMELINE_BLOCK_HEIGHT_PX,
  timelineStatusBlockClass,
  showGuestsOnBlock,
} from "@/src/components/dashboard/reservations/utils/reservation-timeline";
import type { TimelineBlockLayout } from "@/src/components/dashboard/reservations/utils/reservation-timeline";
import { cn } from "@/src/lib/utils";

type TimelineBlockProps = {
  block: TimelineBlockLayout;
  selected: boolean;
  topPx: number;
  onSelect: () => void;
};

export default function TimelineBlock({ block, selected, topPx, onSelect }: TimelineBlockProps) {
  const { reservation } = block;
  const showGuests = showGuestsOnBlock(reservation.guests);

  return (
    <button
      type="button"
      title={block.tooltip}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={cn(
        "absolute z-10 overflow-hidden rounded-lg border px-2 py-1 text-left text-xs font-medium shadow-sm transition-all duration-150",
        "hover:z-20 hover:brightness-110 focus-visible:z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zg-accent/50",
        timelineStatusBlockClass(reservation.status),
        selected && "ring-2 ring-white/80",
      )}
      style={{
        left: `${block.leftPercent}%`,
        width: `${block.widthPercent}%`,
        top: topPx,
        height: TIMELINE_BLOCK_HEIGHT_PX,
        minWidth: "2.5rem",
      }}
    >
      <span className="block truncate">{reservation.guest_name}</span>
      {showGuests ? (
        <span className="block truncate text-[10px] opacity-90">{reservation.guests} pers.</span>
      ) : null}
    </button>
  );
}
