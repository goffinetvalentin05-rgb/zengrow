import { SelectHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "min-h-[44px] w-full cursor-pointer rounded-2xl border border-white/[0.1] bg-white/[0.035] px-4 py-2.5 text-sm text-zg-fg outline-none shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition-all duration-200 ease-out",
        "hover:border-white/[0.16]",
        "focus:border-white/30 focus:ring-2 focus:ring-white/12",
        className,
      )}
      {...props}
    />
  );
}
