import { SelectHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "min-h-[44px] w-full cursor-pointer rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition duration-200",
        "focus:border-[var(--primary)]/40 focus:shadow-[var(--focus-ring)]",
        className,
      )}
      {...props}
    />
  );
}
