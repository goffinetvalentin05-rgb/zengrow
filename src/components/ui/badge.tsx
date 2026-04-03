import { cn } from "@/src/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-[rgba(0,0,0,0.05)] text-[var(--foreground)]/80 ring-1 ring-[rgba(0,0,0,0.06)]",
  success: "bg-[rgba(13,92,74,0.1)] text-[var(--primary)] ring-1 ring-[rgba(13,92,74,0.12)]",
  warning: "bg-amber-50 text-amber-900/85 ring-1 ring-amber-200/80",
  danger: "bg-red-50 text-red-900/85 ring-1 ring-red-200/80",
  info: "bg-slate-50 text-slate-700 ring-1 ring-slate-200/90",
};

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
};

export default function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
