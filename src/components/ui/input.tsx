import { InputHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "min-h-[44px] w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition duration-200",
        "placeholder:text-[var(--muted-foreground)]/75",
        "focus:border-[var(--primary)]/40 focus:shadow-[var(--focus-ring)]",
        "file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[var(--surface-muted)] file:px-3 file:py-2 file:text-xs file:font-medium file:text-[var(--foreground)]",
        type === "color" && "min-h-11 w-14 cursor-pointer p-1.5",
        className,
      )}
      {...props}
    />
  );
}
