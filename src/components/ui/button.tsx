import { ButtonHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "ghostDark" | "danger" | "ghostInverse";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold outline-none transition-all duration-200 ease-out disabled:pointer-events-none disabled:opacity-60 [&_svg]:h-[18px] [&_svg]:w-[18px]";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-gradient-to-br from-[#7c5cff] via-[#6366f1] to-[#4f46e5] text-white shadow-[0_12px_36px_-14px_rgba(124,92,255,0.45)] hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_18px_44px_-12px_rgba(124,92,255,0.5)] focus-visible:ring-2 focus-visible:ring-zg-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app active:scale-[0.99]",
  secondary:
    "border border-zg-border bg-zg-surface/80 text-zg-fg backdrop-blur-sm hover:scale-[1.02] hover:border-zg-border-hover hover:bg-zg-surface-elevated hover:shadow-[0_0_24px_-8px_rgba(124,92,255,0.2)] focus-visible:ring-2 focus-visible:ring-zg-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app active:scale-[0.99]",
  ghost:
    "border border-transparent bg-transparent text-zg-text-secondary hover:bg-zg-card-hover hover:text-zg-fg focus-visible:ring-2 focus-visible:ring-zg-accent/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app",
  ghostDark:
    "border border-transparent bg-transparent text-zg-on-dark-muted hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:ring-2 focus-visible:ring-zg-accent/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg",
  ghostInverse:
    "border border-transparent bg-transparent text-zg-muted hover:bg-zg-card-hover hover:text-zg-fg focus-visible:ring-2 focus-visible:ring-zg-accent/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app",
  danger:
    "border border-transparent bg-zg-danger text-white shadow-sm hover:bg-red-500 focus-visible:ring-2 focus-visible:ring-zg-danger/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app active:scale-[0.99]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-2 text-xs",
  md: "min-h-10 px-5 py-2.5 text-sm",
  lg: "min-h-11 px-6 py-2.5 text-sm",
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
