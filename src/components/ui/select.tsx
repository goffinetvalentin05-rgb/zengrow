import { SelectHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "min-h-[42px] w-full cursor-pointer rounded-xl border border-[rgba(0,0,0,0.07)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--foreground)] outline-none transition",
        "focus:border-[rgba(13,92,74,0.35)] focus:shadow-[0_0_0_3px_rgba(13,92,74,0.15)]",
        className,
      )}
      {...props}
    />
  );
}
