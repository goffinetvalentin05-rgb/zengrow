import type { LucideIcon } from "lucide-react";
import Skeleton from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

type StatAccent = "primary" | "amber" | "stone";

const accentBar: Record<StatAccent, string> = {
  primary: "bg-[#3DBE9F]",
  amber: "bg-[#3DBE9F]",
  stone: "bg-[#3DBE9F]",
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
        "flex gap-4 rounded-xl border border-[#DDEFEA]/80 bg-white p-6 shadow-md",
        "min-h-0 min-w-0",
      )}
      aria-hidden
    >
      <Skeleton className="mt-0.5 h-14 w-1 shrink-0 self-start rounded-full bg-[#3DBE9F]/35" />
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-3 w-2/3 max-w-[180px] bg-[#0F3F3A]/10" />
        <Skeleton className="h-10 w-16 max-w-full bg-[#0F3F3A]/10" />
      </div>
      <Skeleton className="mt-1 h-5 w-5 shrink-0 rounded-md bg-[#1F7A6C]/15" />
    </div>
  );
}

export default function StatCard({ label, value, icon: Icon, accent = "primary" }: StatCardProps) {
  const isText = typeof value === "string" && value.includes("·");
  return (
    <div
      className={cn(
        "flex gap-4 rounded-xl border border-[#DDEFEA]/80 bg-white p-6 shadow-md",
        "min-h-0 min-w-0",
      )}
    >
      <div className={cn("mt-0.5 h-14 w-1 shrink-0 self-start rounded-full", accentBar[accent])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0F3F3A]/45">{label}</p>
        <p
          className={cn(
            "mt-2 font-bold tracking-tight text-[#0F3F3A]",
            isText ? "text-xl leading-snug sm:text-2xl" : "text-4xl tabular-nums",
          )}
        >
          {value}
        </p>
      </div>
      <Icon className="mt-1 h-5 w-5 shrink-0 text-[#1F7A6C]/45" strokeWidth={1.75} aria-hidden />
    </div>
  );
}
