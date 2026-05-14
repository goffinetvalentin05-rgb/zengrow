import { ButtonHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "ghostDark" | "danger" | "ghostInverse";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium outline-none transition-all duration-150 disabled:pointer-events-none disabled:opacity-60";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-zg-accent text-white shadow-sm hover:bg-zg-accent-hover hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-zg-accent/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-canvas active:scale-[0.99]",
  secondary:
    "border border-zg-border bg-zg-surface text-zg-fg shadow-sm hover:border-zg-border-hover hover:bg-zg-card-hover focus-visible:ring-2 focus-visible:ring-zg-accent/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-canvas",
  ghost:
    "border border-transparent bg-transparent text-zg-text-secondary hover:bg-zg-surface-elevated hover:text-zg-fg focus-visible:ring-2 focus-visible:ring-zg-accent/15 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-canvas",
  ghostDark:
    "border border-transparent bg-transparent text-zg-on-dark-muted hover:bg-white/5 hover:text-zg-on-dark focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg",
  ghostInverse:
    "border border-transparent bg-transparent text-zg-muted hover:bg-zg-surface-elevated hover:text-zg-fg focus-visible:ring-2 focus-visible:ring-zg-accent/15 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
  danger:
    "border border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-canvas",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-2 text-xs",
  md: "min-h-10 px-4 py-2.5 text-sm",
  lg: "min-h-11 px-5 py-2.5 text-sm",
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
  return cn(base, variantClasses[variant], sizeClasses[size], className);
}

export default function Button({
  className = "",
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return <button className={buttonClassName({ variant, size, className })} {...props} />;
}
