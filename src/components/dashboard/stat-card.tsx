import type { LucideIcon } from "lucide-react";
import Skeleton from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

type StatAccent = "primary" | "amber" | "stone";

const accentBar: Record<StatAccent, string> = {
  primary: "bg-green-600",
  amber: "bg-amber-500",
  stone: "bg-gray-400",
};

type StatCardProps = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: StatAccent;
};

export function StatCardSkeleton() {
  return (
    <div
      className={cn(
        "flex gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm",
        "min-h-0 min-w-0",
      )}
      aria-hidden
    >
      <Skeleton className="mt-0.5 h-14 w-1 shrink-0 self-start rounded-full" />
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-3 w-2/3 max-w-[180px]" />
        <Skeleton className="h-10 w-16 max-w-full" />
      </div>
      <Skeleton className="mt-1 h-5 w-5 shrink-0 rounded-md" />
    </div>
  );
}

export default function StatCard({ label, value, icon: Icon, accent = "primary" }: StatCardProps) {
  const isText = typeof value === "string" && value.includes("·");
  return (
    <div
      className={cn(
        "flex gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm",
        "min-h-0 min-w-0",
      )}
    >
      <div className={cn("mt-0.5 h-14 w-1 shrink-0 self-start rounded-full", accentBar[accent])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p
          className={cn(
            "mt-2 font-bold tracking-tight text-gray-900",
            isText ? "text-xl leading-snug sm:text-2xl" : "text-4xl tabular-nums",
          )}
        >
          {value}
        </p>
      </div>
      <Icon className="mt-1 h-5 w-5 shrink-0 text-gray-400" strokeWidth={1.75} aria-hidden />
    </div>
  );
}
