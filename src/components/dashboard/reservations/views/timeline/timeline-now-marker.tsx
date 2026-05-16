type TimelineNowMarkerProps = {
  leftPercent: number;
};

export default function TimelineNowMarker({ leftPercent }: TimelineNowMarkerProps) {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-30 w-0.5 -translate-x-1/2 bg-zg-accent shadow-[0_0_12px_rgba(232,93,44,0.75)]"
      style={{ left: `${leftPercent}%` }}
      aria-hidden
    >
      <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-zg-accent animate-pulse" />
    </div>
  );
}
