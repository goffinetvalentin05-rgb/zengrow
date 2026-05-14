import { SelectHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "min-h-[44px] w-full cursor-pointer rounded-xl border border-zg-border bg-zg-surface px-4 py-2.5 text-sm text-zg-fg outline-none transition-all duration-200 ease-out",
        "hover:border-zg-border-hover",
        "focus:border-zg-border-focus focus:ring-2 focus:ring-zg-accent/20",
        className,
      )}
      {...props}
    />
  );
}
