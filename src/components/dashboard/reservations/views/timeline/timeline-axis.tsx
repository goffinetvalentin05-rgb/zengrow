import type { TimelineServiceRowLayout } from "@/src/components/dashboard/reservations/utils/reservation-timeline";

type TimelineAxisProps = {
  row: TimelineServiceRowLayout;
};

export default function TimelineAxis({ row }: TimelineAxisProps) {
  if (!row.active) return null;

  return (
    <div className="relative mb-2 h-6 border-b border-zg-border">
      {row.hourTicks.map((tick) => (
        <span
          key={`${tick.label}-${tick.leftPercent}`}
          className="absolute -translate-x-1/2 text-[10px] font-medium tabular-nums text-zg-text-muted"
          style={{ left: `${tick.leftPercent}%` }}
        >
          {tick.label}
        </span>
      ))}
    </div>
  );
}
