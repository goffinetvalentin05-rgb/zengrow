import { cn } from "@/src/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "sand";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-zg-surface-elevated text-zg-fg/75 ring-1 ring-zg-border-strong/80",
  success: "bg-zg-highlight text-zg-teal ring-1 ring-zg-border-accent/85",
  warning: "bg-[#fffbeb] text-[#92400e] ring-1 ring-amber-200/90",
  danger: "bg-red-50 text-red-900 ring-1 ring-red-200/90",
  info: "bg-zg-surface-soft/90 text-zg-fg/68 ring-1 ring-zg-border/85",
  sand: "bg-zg-surface-elevated text-zg-fg/58 ring-1 ring-zg-border-strong/75",
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
