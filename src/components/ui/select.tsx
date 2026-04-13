import { SelectHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "min-h-[44px] w-full cursor-pointer rounded-xl border border-zg-border-strong/90 bg-zg-surface/95 px-4 py-2.5 text-sm text-zg-fg outline-none transition duration-200 shadow-sm",
        "focus:border-[#1F7A6C]/35 focus:ring-2 focus:ring-[#1F7A6C]/12",
        className,
      )}
      {...props}
    />
  );
}
