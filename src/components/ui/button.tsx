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
    "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary-hover)] hover:shadow-[0_4px_14px_rgba(26,107,80,0.32)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/35 focus-visible:ring-offset-2",
  secondary:
    "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-muted)] hover:shadow-[var(--card-shadow)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25 focus-visible:ring-offset-2",
  ghost:
    "border border-transparent bg-transparent text-[var(--muted-foreground)] hover:border-[var(--border)] hover:bg-[var(--surface-muted)]/80 hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/20 focus-visible:ring-offset-2",
  ghostInverse:
    "border border-transparent bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-2 focus-visible:ring-[var(--primary)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-[0_4px_14px_rgba(220,38,38,0.35)] focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3.5 py-1.5 text-sm font-medium",
  md: "min-h-[44px] px-5 py-2.5 text-sm font-medium",
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
        "inline-flex items-center justify-center gap-2 rounded-lg transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
