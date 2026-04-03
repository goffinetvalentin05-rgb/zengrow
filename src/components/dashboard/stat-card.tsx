import type { LucideIcon } from "lucide-react";
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

export default function StatCard({ label, value, icon: Icon, accent = "primary" }: StatCardProps) {
  return (
    <div className="flex gap-4 border-b border-gray-100 py-6 last:border-0 sm:border-0 sm:py-4">
      <div className={cn("mt-1 h-10 w-1 shrink-0 rounded-full", accentBar[accent])} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
        <p className="mt-1 text-4xl font-semibold tabular-nums tracking-tight text-gray-900">{value}</p>
      </div>
      <Icon className="mt-1 h-5 w-5 shrink-0 text-gray-400" strokeWidth={1.75} aria-hidden />
    </div>
  );
}
