import { InputHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "min-h-10 w-full rounded-lg border border-zg-border bg-zg-surface px-3 py-2.5 text-sm text-zg-fg outline-none transition-all duration-150",
        "placeholder:text-zg-text-muted/60",
        "focus:border-zg-border-focus focus:ring-2 focus:ring-zg-accent/15",
        "file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-zg-surface-elevated file:px-3 file:py-2 file:text-xs file:font-medium file:text-zg-fg/85",
        type === "color" && "min-h-11 w-14 cursor-pointer p-1.5",
        className,
      )}
      {...props}
    />
  );
}
