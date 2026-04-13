import { cn } from "@/src/lib/utils";

type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-xl bg-zg-border/55", className)} />;
}
