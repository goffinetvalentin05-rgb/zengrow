import Badge from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";

type Props = {
  impact: number;
  effort: number;
  confidence: number;
  score: number;
  labels: { impact: string; effort: string; confidence: string; score: string };
  className?: string;
};

export function ScorePills({ impact, effort, confidence, score, labels, className }: Props) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <Badge tone="info">
        {labels.impact} {impact}/10
      </Badge>
      <Badge tone="neutral">
        {labels.effort} {effort}/10
      </Badge>
      <Badge tone="premium">
        {labels.confidence} {confidence}%
      </Badge>
      <Badge tone="accent">
        {labels.score} {score}/100
      </Badge>
    </div>
  );
}
