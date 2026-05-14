import { SelectHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "min-h-[44px] w-full cursor-pointer rounded-xl border border-zg-border bg-zg-surface px-4 py-2.5 text-sm text-zg-fg outline-none transition duration-200 shadow-sm",
        "focus:border-zg-teal/35 focus:ring-2 focus:ring-zg-teal/12",
        className,
      )}
      {...props}
    />
  );
}
