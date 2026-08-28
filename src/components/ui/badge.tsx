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

/** Monochrome par défaut : la couleur est réservée aux états sémantiques. */
const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-white/[0.08] bg-white/[0.04] text-zg-text-secondary",
  success: "border-zg-success/25 bg-zg-success-soft-bg text-zg-success",
  warning: "border-zg-warning/25 bg-zg-warning-soft-bg text-zg-warning",
  danger: "border-zg-danger/25 bg-zg-danger-soft-bg text-zg-danger",
  info: "border-white/[0.08] bg-white/[0.04] text-zg-text-secondary",
  sand: "border-white/[0.06] bg-white/[0.03] text-zg-text-muted",
  accent: "border-white/[0.14] bg-white/[0.07] text-zg-fg",
  premium: "border-white/[0.08] bg-white/[0.04] text-zg-text-secondary",
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
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide transition-colors duration-200 ease-out",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
