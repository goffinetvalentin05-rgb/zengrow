"use client";

import { cn } from "@/src/lib/utils";

type FeedbackRatingRangeProps = {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
  idPrefix?: string;
};

function clampRating(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value)));
}

export default function FeedbackRatingRange({
  min,
  max,
  onChange,
  idPrefix = "feedback-rating",
}: FeedbackRatingRangeProps) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const minPercent = ((lo - 1) / 4) * 100;
  const maxPercent = ((hi - 1) / 4) * 100;

  function handleMinChange(nextMin: number) {
    const clamped = clampRating(nextMin);
    onChange(Math.min(clamped, hi), hi);
  }

  function handleMaxChange(nextMax: number) {
    const clamped = clampRating(nextMax);
    onChange(lo, Math.max(clamped, lo));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-zg-fg tabular-nums">
          {lo} – {hi} étoiles
        </span>
        <span className="text-xs text-zg-text-muted">sur 5</span>
      </div>
      <div className="relative h-8 pt-1">
        <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-zg-border" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-zg-accent"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          aria-hidden
        />
        <label className="sr-only" htmlFor={`${idPrefix}-min`}>
          Note minimale
        </label>
        <input
          id={`${idPrefix}-min`}
          type="range"
          min={1}
          max={5}
          step={1}
          value={lo}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-8 w-full appearance-none bg-transparent",
            "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:border-zg-accent [&::-webkit-slider-thumb]:bg-zg-surface",
            "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-zg-accent",
            "[&::-moz-range-thumb]:bg-zg-surface",
          )}
        />
        <label className="sr-only" htmlFor={`${idPrefix}-max`}>
          Note maximale
        </label>
        <input
          id={`${idPrefix}-max`}
          type="range"
          min={1}
          max={5}
          step={1}
          value={hi}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-8 w-full appearance-none bg-transparent",
            "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2",
            "[&::-webkit-slider-thumb]:border-zg-accent [&::-webkit-slider-thumb]:bg-zg-surface",
            "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4",
            "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-zg-accent",
            "[&::-moz-range-thumb]:bg-zg-surface",
          )}
        />
      </div>
      <div className="flex justify-between text-[10px] font-medium text-zg-text-muted tabular-nums">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
}
