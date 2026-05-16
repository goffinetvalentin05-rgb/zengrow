"use client";

import { Star } from "lucide-react";
import { cn } from "@/src/lib/utils";

type FeedbackStarsProps = {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;

export default function FeedbackStars({ value, max = 5, size = "md", className }: FeedbackStarsProps) {
  const clamped = Math.min(max, Math.max(0, Math.round(value)));

  return (
    <div className={cn("flex items-center gap-0.5", className)} role="img" aria-label={`${value} sur ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(sizeClass[size], i < clamped ? "fill-amber-400 text-amber-400" : "text-zg-border")}
          strokeWidth={2}
          aria-hidden
        />
      ))}
    </div>
  );
}
