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
    "border border-transparent bg-gradient-to-r from-[#1F7A6C] to-[#3DBE9F] text-white shadow-[0_10px_28px_-12px_rgba(31,122,108,0.78)] hover:brightness-[1.03] active:brightness-[0.98] focus-visible:ring-2 focus-visible:ring-[#1F7A6C]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-canvas",
  secondary:
    "border border-[#CBE6DF] bg-white/95 text-[#0F3F3A] shadow-sm hover:border-[#A3D8CC] hover:bg-[#F0F9F7] focus-visible:ring-2 focus-visible:ring-[#1F7A6C]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-canvas",
  ghost:
    "border border-transparent bg-transparent text-[#0F3F3A]/72 hover:bg-[#F0F9F7] hover:text-[#0F3F3A] focus-visible:ring-2 focus-visible:ring-[#1F7A6C]/22 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-canvas",
  ghostInverse:
    "border border-transparent bg-transparent text-[#0F3F3A]/72 hover:bg-[#F0F9F7] hover:text-[#0F3F3A] focus-visible:ring-2 focus-visible:ring-[#1F7A6C]/22 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
  danger:
    "border border-transparent bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-zg-canvas",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 px-4 py-2 text-sm font-semibold",
  md: "min-h-11 px-5 py-2.5 text-sm font-semibold",
  lg: "min-h-12 px-6 py-3 text-sm font-semibold",
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
        "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-200 outline-none disabled:pointer-events-none disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
