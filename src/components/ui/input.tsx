import { InputHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "min-h-10 w-full rounded-xl border border-zg-border bg-white/[0.03] px-3 py-2.5 text-sm text-zg-fg outline-none transition-colors duration-200 ease-out",
        "placeholder:text-zg-text-placeholder",
        "hover:border-zg-border-strong",
        "focus:border-zg-border-focus focus:ring-2 focus:ring-white/15",
        "file:mr-3 file:cursor-pointer file:rounded-xl file:border-0 file:bg-zg-surface-elevated file:px-3 file:py-2 file:text-xs file:font-medium file:text-zg-fg/90",
        type === "color" && "min-h-11 w-14 cursor-pointer p-1.5",
        className,
      )}
      {...props}
    />
  );
}
