import { InputHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "min-h-10 w-full rounded-xl border border-zg-border bg-zg-surface/90 px-3 py-2.5 text-sm text-zg-fg outline-none backdrop-blur-sm transition-all duration-200 ease-out",
        "placeholder:text-zg-text-placeholder",
        "hover:border-zg-border-strong",
        "focus:border-zg-border-focus focus:ring-2 focus:ring-zg-accent/25 focus:shadow-[0_0_20px_-8px_rgba(124,92,255,0.35)]",
        "file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-zg-surface-elevated file:px-3 file:py-2 file:text-xs file:font-medium file:text-zg-fg/90",
        type === "color" && "min-h-11 w-14 cursor-pointer p-1.5",
        className,
      )}
      {...props}
    />
  );
}
