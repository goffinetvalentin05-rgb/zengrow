import { cn } from "@/src/lib/utils";

type BadgeTone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "sand"
  | "accent"
  | "premium";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-zg-neutral-badge-bg text-zg-text-secondary",
  success: "bg-zg-success-soft-bg text-zg-success",
  warning: "bg-zg-warning-soft-bg text-zg-warning",
  danger: "bg-zg-danger-soft-bg text-zg-danger",
  info: "bg-zg-info-soft-bg text-zg-info",
  sand: "bg-zg-neutral-badge-bg text-zg-text-muted",
  accent: "bg-zg-accent-soft-bg text-zg-accent-soft-text",
  premium: "bg-zg-premium-soft-bg text-zg-premium",
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
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-all duration-200 ease-out",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
