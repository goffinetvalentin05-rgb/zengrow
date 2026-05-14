import { cn } from "@/src/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "sand" | "accent";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-zg-surface-elevated text-zg-text-secondary ring-1 ring-zg-border",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/90",
  warning: "bg-amber-50 text-amber-900 ring-1 ring-amber-200/85",
  danger: "bg-red-50 text-red-800 ring-1 ring-red-200/90",
  info: "bg-zg-surface-soft text-zg-text-secondary ring-1 ring-zg-border",
  sand: "bg-zg-surface-soft text-zg-text-muted ring-1 ring-zg-border",
  accent: "bg-zg-accent-soft-bg text-zg-accent-soft-text ring-1 ring-zg-border-accent",
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
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tracking-wide transition-all duration-150",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
