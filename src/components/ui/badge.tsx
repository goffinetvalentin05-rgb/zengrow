import { cn } from "@/src/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "sand";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-zg-surface-elevated text-zg-muted ring-1 ring-zg-border",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/90",
  warning: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/85",
  danger: "bg-red-50 text-red-800 ring-1 ring-red-200/90",
  info: "bg-zg-surface-soft text-zg-muted ring-1 ring-zg-border",
  sand: "bg-zg-surface-soft text-zg-fg-muted ring-1 ring-zg-border",
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
        "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
