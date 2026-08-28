import { ButtonHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "ghostDark" | "danger" | "ghostInverse";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium outline-none transition-colors duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-[16px] [&_svg]:w-[16px]";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-white font-semibold text-zinc-950 hover:bg-zinc-200 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app",
  secondary:
    "border border-zg-border bg-transparent text-zg-fg hover:border-zg-border-hover hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-white/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app",
  ghost:
    "border border-transparent bg-transparent text-zg-text-secondary hover:bg-white/[0.05] hover:text-zg-fg focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app",
  ghostDark:
    "border border-transparent bg-transparent text-zg-on-dark-muted hover:bg-zg-sidebar-hover hover:text-zg-on-dark focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-sidebar-bg",
  ghostInverse:
    "border border-transparent bg-transparent text-zg-muted hover:bg-white/[0.05] hover:text-zg-fg focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app",
  danger:
    "border border-zg-danger/30 bg-zg-danger-soft-bg text-zg-danger hover:bg-zg-danger/20 focus-visible:ring-2 focus-visible:ring-zg-danger/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-app",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 py-2 text-[13px]",
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
