import { ButtonHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "ghostInverse";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary-hover)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/35 focus-visible:ring-offset-2",
  secondary:
    "border border-[rgba(0,0,0,0.12)] bg-transparent text-[var(--foreground)] hover:bg-[rgba(0,0,0,0.03)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25 focus-visible:ring-offset-2",
  ghost:
    "bg-transparent text-[var(--muted-foreground)] hover:bg-[rgba(0,0,0,0.04)] hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20 focus-visible:ring-offset-2",
  ghostInverse:
    "bg-transparent text-[rgba(255,255,255,0.55)] hover:bg-[rgba(255,255,255,0.07)] hover:text-white focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--sidebar)]",
  danger:
    "bg-[var(--danger)] text-white hover:bg-[#991b1b] focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3.5 py-1.5 text-sm font-medium",
  md: "min-h-[42px] px-5 py-2.5 text-sm font-medium",
  lg: "min-h-11 px-6 py-3 text-sm font-medium",
};

export default function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl transition-all outline-none disabled:pointer-events-none disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
