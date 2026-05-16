"use client";

import TimelineAxis from "@/src/components/dashboard/reservations/views/timeline/timeline-axis";
import TimelineBlock from "@/src/components/dashboard/reservations/views/timeline/timeline-block";
import TimelineNowMarker from "@/src/components/dashboard/reservations/views/timeline/timeline-now-marker";
import {
  TIMELINE_BLOCK_HEIGHT_PX,
  TIMELINE_LANE_GAP_PX,
  type TimelineServiceRowLayout,
} from "@/src/components/dashboard/reservations/utils/reservation-timeline";
import { Moon, Sun } from "lucide-react";

type TimelineServiceRowProps = {
  row: TimelineServiceRowLayout;
  selectedReservationId: string | null;
  onSelectReservation: (id: string) => void;
  showNowMarker: boolean;
};

export default function TimelineServiceRow({
  row,
  selectedReservationId,
  onSelectReservation,
  showNowMarker,
}: TimelineServiceRowProps) {
  const Icon = row.key === "lunch" ? Sun : Moon;
  const rowHeight =
    row.laneCount * (TIMELINE_BLOCK_HEIGHT_PX + TIMELINE_LANE_GAP_PX) + TIMELINE_LANE_GAP_PX;

  if (!row.active) {
    return (
      <div className="rounded-xl border border-dashed border-zg-border/80 bg-zg-surface/40 px-4 py-6 text-sm text-zg-text-muted">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 opacity-50" aria-hidden />
          <span>{row.label} — pas de service</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zg-border bg-zg-surface/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-zg-accent" aria-hidden />
        <h3 className="text-sm font-semibold text-zg-fg">{row.label}</h3>
      </div>
      <TimelineAxis row={row} />
      <div className="relative" style={{ height: rowHeight }}>
        {row.overloadSegments.map((seg, i) => (
          <div
            key={`overload-${i}`}
            className="pointer-events-none absolute inset-y-0 z-0 rounded-md bg-red-500/10 ring-1 ring-red-500/25"
            style={{ left: `${seg.leftPercent}%`, width: `${seg.widthPercent}%` }}
            title="Trop occupé"
          />
        ))}
        {showNowMarker && row.nowLeftPercent != null ? (
          <TimelineNowMarker leftPercent={row.nowLeftPercent} />
        ) : null}
        {row.blocks.map((block) => (
          <TimelineBlock
            key={block.reservation.id}
            block={block}
            selected={selectedReservationId === block.reservation.id}
            topPx={block.lane * (TIMELINE_BLOCK_HEIGHT_PX + TIMELINE_LANE_GAP_PX)}
            onSelect={() => onSelectReservation(block.reservation.id)}
          />
        ))}
      </div>
    </div>
  );
}
