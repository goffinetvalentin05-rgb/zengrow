import { cn } from "@/src/lib/utils";

type Props = {
  impact: number;
  effort: number;
  confidence: number;
  score: number;
  labels: { impact: string; effort: string; confidence: string; score: string };
  className?: string;
};

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-[11px] uppercase tracking-wider text-zg-muted">{label}</span>
      <span className={cn("text-[13px] tabular-nums", strong ? "font-semibold text-zg-fg" : "text-zg-text-secondary")}>
        {value}
      </span>
    </span>
  );
}

export function ScorePills({ impact, effort, confidence, score, labels, className }: Props) {
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-5 gap-y-2", className)}>
      <Metric label={labels.impact} value={`${impact}/10`} />
      <Metric label={labels.effort} value={`${effort}/10`} />
      <Metric label={labels.confidence} value={`${confidence}%`} />
      <Metric label={labels.score} value={`${score}/100`} strong />
    </div>
  );
}
