import { cn } from "@/src/lib/utils";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "sand";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-stone-100 text-stone-700 ring-1 ring-stone-200/90",
  success: "bg-[rgba(26,107,80,0.12)] text-[#145239] ring-1 ring-[rgba(26,107,80,0.22)]",
  warning: "bg-[#fffbeb] text-[#92400e] ring-1 ring-amber-200/90",
  danger: "bg-red-50 text-red-900 ring-1 ring-red-200/90",
  info: "bg-stone-50 text-stone-600 ring-1 ring-stone-200/90",
  sand: "bg-[var(--badge-sand-bg)] text-[var(--badge-sand-text)] ring-1 ring-stone-200/70",
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
