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
    "border border-transparent bg-gradient-to-r from-[#E85D2C] to-[#EA7349] text-white shadow-[0_10px_28px_-12px_rgba(232,93,44,0.45)] hover:brightness-[1.02] active:brightness-[0.98] focus-visible:ring-2 focus-visible:ring-[#E85D2C]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-canvas",
  secondary:
    "border border-zg-border-strong bg-zg-surface text-zg-fg shadow-sm hover:border-zg-border-accent hover:bg-zg-highlight/70 focus-visible:ring-2 focus-visible:ring-zg-teal/22 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-canvas",
  ghost:
    "border border-transparent bg-transparent text-zg-muted hover:bg-zg-highlight/80 hover:text-zg-fg focus-visible:ring-2 focus-visible:ring-zg-teal/18 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-canvas",
  ghostInverse:
    "border border-transparent bg-transparent text-zg-muted hover:bg-zg-highlight/80 hover:text-zg-fg focus-visible:ring-2 focus-visible:ring-zg-teal/18 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
  danger:
    "border border-transparent bg-[#DC2626] text-white shadow-sm hover:bg-[#B91C1C] focus-visible:ring-2 focus-visible:ring-red-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-canvas",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm font-semibold",
  md: "min-h-11 px-5 py-2.5 text-sm font-semibold",
  lg: "min-h-12 px-6 py-3 text-sm font-semibold",
};

export function buttonClassName({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export default function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}
